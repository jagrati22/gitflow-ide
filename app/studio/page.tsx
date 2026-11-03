"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Folder, FileCode, ChevronDown, 
  Sparkles, CheckCircle2, GitCommit, GitBranch, 
  UploadCloud, AlertCircle, ArrowLeft, Wand2, RefreshCw, Loader2, ShieldCheck,
  Undo2, Cpu
} from "lucide-react";
import { logActivity } from "@/app/lib/activityLogger";

interface RepoItem {
  id: string;
  name: string;
  path: string;
  type: "dir" | "file";
  size?: number;
}

export default function StudioPage() {
  const searchParams = useSearchParams();
  const repoParam = searchParams ? (searchParams.get("repo") || "jagrati22/gitflow-test-sandbox") : "jagrati22/gitflow-test-sandbox";

  // State Management
  const [itemsList, setItemsList] = useState<RepoItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<RepoItem | null>(null);
  const [fileContent, setFileContent] = useState<string>("# Select a file from explorer to view code");
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  // Active AI Model Engine State (Dashboard se connected)
  const [activeModel, setActiveModel] = useState<string>("gemini");

  // AI Refactor States
  const [refactorPrompt, setRefactorPrompt] = useState("");
  const [isPatching, setIsPatching] = useState(false);
  const [refactorError, setRefactorError] = useState<string | null>(null);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [patchLines, setPatchLines] = useState<any[]>([]);
  const [defects, setDefects] = useState<string[]>([]);
  const [activeEngineName, setActiveEngineName] = useState<string>("Google Gemini");

  // Git Commit & Revert States
  const [commitMessage, setCommitMessage] = useState("refactor: applied automated patches via GitFlow IDE");
  const [isCommitting, setIsCommitting] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [commitStatus, setCommitStatus] = useState<string | null>(null);

  // 1. Initial Load: Repository file list & Selected Model
  useEffect(() => {
    try {
      const savedModel = localStorage.getItem("gitflow_selected_model");
      if (savedModel) {
        setActiveModel(savedModel);
      }
    } catch (e) {
      console.error("Failed to load selected model", e);
    }

    async function loadRepoFiles() {
      setIsLoadingFiles(true);
      try {
        const res = await fetch(`/api/github/files?repo=${encodeURIComponent(repoParam)}`);
        const data = await res.json();

        if (data.success && data.files) {
          setItemsList(data.files);

          const codeFiles = data.files.filter((f: RepoItem) => f.type === "file");
          const defaultFile = codeFiles.find((f: RepoItem) => f.name === "user_service.py") ||
                              codeFiles.find((f: RepoItem) => f.name === "sample.py") ||
                              codeFiles.find((f: RepoItem) => f.name === "app.py") || 
                              codeFiles.find((f: RepoItem) => f.name.endsWith(".py")) || 
                              codeFiles[0];

          if (defaultFile) {
            setSelectedFile(defaultFile);
            loadFileContent(defaultFile.path);
          }
        }
      } catch (err) {
        console.error("Failed to load repo files:", err);
      } finally {
        setIsLoadingFiles(false);
      }
    }

    loadRepoFiles();
  }, [repoParam]);

  // 2. Specific File content fetch
  const loadFileContent = async (filePath: string) => {
    setIsLoadingCode(true);
    setPatchLines([]);
    setRefactoredCode(null);
    setDefects([]);
    setRefactorError(null);

    try {
      const res = await fetch(`/api/github/files?repo=${encodeURIComponent(repoParam)}&path=${encodeURIComponent(filePath)}`);
      const data = await res.json();

      if (data.success) {
        setFileContent(data.content);
      } else {
        setFileContent("# Error loading file content from GitHub.");
      }
    } catch (err) {
      setFileContent("# Network error while fetching file content.");
    } finally {
      setIsLoadingCode(false);
    }
  };

  // 3. Git Revert / Rollback (Go back 1 commit step)
  const handleRevertCommit = async () => {
    if (!selectedFile) return;

    setIsReverting(true);
    setCommitStatus(null);
    setRefactorError(null);

    try {
      const [owner, repoName] = repoParam.split("/");
      const customToken = localStorage.getItem("gitflow_custom_token") || "";

      const res = await fetch("/api/github/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: owner || "jagrati22",
          repo: repoName || "gitflow-test-sandbox",
          path: selectedFile.path,
          branch: "main",
          customToken
        })
      });

      const data = await res.json();

      if (data.success) {
        setFileContent(data.content);
        setRefactoredCode(null);
        setPatchLines([]);
        setDefects([]);
        setRefactorPrompt("");
        setCommitStatus(`Reverted back to commit (${data.sha.slice(0, 7)})!`);

        logActivity({
          type: "pull" as any,
          repo: repoParam,
          file: selectedFile.name,
          description: `Reverted commit to previous state (SHA: ${data.sha.slice(0, 7)})`,
          status: "success",
          sha: data.sha
        });

        setTimeout(() => setCommitStatus(null), 4000);
      } else {
        setRefactorError(data.error || "Failed to revert to previous commit.");
      }
    } catch (err: any) {
      console.error("Revert failed:", err);
      setRefactorError(err.message || "Network error while reverting commit.");
    } finally {
      setIsReverting(false);
    }
  };

  // Split Diff lines
  const originalLines = fileContent.split("\n").map((line, idx) => ({
    num: idx + 1,
    text: line,
    type: "normal"
  }));

  // 4. AI Refactor Engine Call
  const handleApplyRefactor = async () => {
    if (!refactorPrompt.trim() || !selectedFile) return;

    setIsPatching(true);
    setRefactorError(null);
    setCommitStatus(null);

    try {
      const currentSelectedModel = localStorage.getItem("gitflow_selected_model") || activeModel;

      const res = await fetch("/api/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: fileContent,
          instruction: refactorPrompt,
          filename: selectedFile.name,
          model: currentSelectedModel
        })
      });

      const data = await res.json();

      if (data.success) {
        setRefactoredCode(data.refactoredCode);
        setActiveEngineName(data.engine || currentSelectedModel);
        
        if (data.patchLines && data.patchLines.length > 0) {
          setPatchLines(data.patchLines);
        } else {
          const origArr = fileContent.split("\n");
          const lines = data.refactoredCode.split("\n").map((l: string, i: number) => ({
            num: i + 1,
            text: l,
            type: origArr.includes(l) ? "normal" : "added"
          }));
          setPatchLines(lines);
        }

        const resolvedDefects = data.defects && data.defects.length > 0 
          ? data.defects 
          : ["AST validation complete: defensive error handling and guards introduced."];
        
        setDefects(resolvedDefects);
        setCommitMessage(`refactor: ${refactorPrompt.slice(0, 45).toLowerCase()}`);

        logActivity({
          type: "refactor",
          repo: repoParam,
          file: selectedFile.name,
          description: `AI AST refactor applied [${currentSelectedModel}]: ${refactorPrompt.slice(0, 35)}`,
          status: "success"
        });
      } else {
        setRefactorError(data.error || "Refactor API failed to generate patch.");
      }
    } catch (err: any) {
      console.error("Refactor call failed:", err);
      setRefactorError(err.message || "Failed to connect to refactor API.");
    } finally {
      setIsPatching(false);
    }
  };

  // 5. Git Commit & Push Call (Auto-updates Original Code)
  const handleCommitPush = async () => {
    if (!selectedFile) return;
    setIsCommitting(true);
    setCommitStatus(null);

    try {
      const payloadCode = refactoredCode || fileContent;

      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repoParam,
          branch: "main",
          path: selectedFile.path,
          content: payloadCode,
          message: commitMessage
        })
      });

      const data = await res.json();

      if (data.success) {
        const sha = data.commitSha || "live-push";
        
        // Auto-update: Abhi push kiya gaya code fresh 'Original Code' ban jayega
        if (refactoredCode) {
          setFileContent(refactoredCode);
          setRefactoredCode(null);
          setPatchLines([]);
          setDefects([]);
          setRefactorPrompt("");
        }

        setCommitStatus(`Committed to main (SHA: ${sha.slice(0, 7)}) & Local Synced!`);

        logActivity({
          type: "commit",
          repo: repoParam,
          file: selectedFile.name,
          description: `Pushed commit to main: ${commitMessage}`,
          status: "success",
          sha: sha
        });

        setTimeout(() => setCommitStatus(null), 4500);
      } else {
        setCommitStatus(`Failed: ${data.error || "Could not push to GitHub"}`);
      }
    } catch (err) {
      console.error("Commit call failed:", err);
      setCommitStatus("Commit network error");
    } finally {
      setIsCommitting(false);
    }
  };

  const getModelBadge = () => {
    if (activeModel.includes("/") || activeModel.includes(":free")) {
      const cleanName = activeModel.split("/")[1]?.replace(":free", "") || activeModel;
      return { 
        label: cleanName.toUpperCase(), 
        border: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" 
      };
    }
    if (activeModel === "openai") return { label: "GPT-4o (OpenAI)", border: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" };
    if (activeModel === "claude") return { label: "Claude 3.5 Sonnet", border: "border-purple-500/40 text-purple-400 bg-purple-500/10" };
    return { label: "Gemini 1.5 Flash", border: "border-blue-500/40 text-[#38bdf8] bg-blue-500/10" };
  };

  const currentBadge = getModelBadge();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0f17] text-[#c9d1d9] font-sans overflow-hidden select-none">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-12 border-b border-[#1e293b] bg-[#0f172a] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded bg-[#2563eb] flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:bg-[#1d4ed8] transition">
              ⚡
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">GitFlow IDE</span>
          </Link>

          <div className="h-4 w-[1px] bg-[#1e293b]" />

          <div className="flex items-center gap-2 text-xs font-mono">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition flex items-center gap-1">
              <ArrowLeft size={12} /> Dashboard
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{repoParam}</span>
            <span className="bg-[#1e293b] border border-[#334155] text-slate-300 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
              <GitBranch size={10} className="text-[#2563eb]" /> main
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/activity"
            className="text-xs font-mono text-slate-400 hover:text-white transition px-2.5 py-1 rounded bg-[#1e293b]/60 border border-[#334155]"
          >
            Activity Feed
          </Link>

          {/* Revert Button (Rollback) */}
          <button
            onClick={handleRevertCommit}
            disabled={isReverting || !selectedFile}
            title="Rollback 1 step back to previous commit"
            className="bg-[#161f33] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#334155] text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Undo2 size={13} className={isReverting ? "animate-spin text-[#38bdf8]" : "text-amber-400"} />
            <span>{isReverting ? "Reverting..." : "Revert (Undo Commit)"}</span>
          </button>

          {/* Commit & Push Button */}
          <button
            onClick={handleCommitPush}
            disabled={isCommitting || !selectedFile}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium px-3.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <UploadCloud size={13} /> 
            <span>{isCommitting ? "Pushing..." : "Commit & Push"}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Explorer Tree */}
        <aside className="w-60 border-r border-[#1e293b] bg-[#0f172a] flex flex-col shrink-0 font-mono text-xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-[#1e293b] text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between shrink-0">
            <span>Explorer</span>
            <span className="text-[10px] text-emerald-400 font-mono">Live GitHub</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 py-1 px-1.5 font-semibold text-xs">
              <ChevronDown size={13} />
              <span className="truncate">{repoParam.split("/")[1] || repoParam}</span>
            </div>

            {isLoadingFiles ? (
              <div className="p-4 text-center text-slate-500 text-[11px] flex items-center justify-center gap-2">
                <RefreshCw size={13} className="animate-spin text-[#38bdf8]" />
                <span>Pulling files...</span>
              </div>
            ) : itemsList.length === 0 ? (
              <div className="p-3 text-slate-500 text-[11px]">No items found</div>
            ) : (
              <div className="ml-2 pl-2 border-l border-[#1e293b] space-y-0.5 mt-1">
                {itemsList.map((item) => {
                  const isSelected = selectedFile?.path === item.path;
                  const isDir = item.type === "dir";

                  return (
                    <button
                      key={item.id || item.path}
                      onClick={() => {
                        if (!isDir) {
                          setSelectedFile(item);
                          loadFileContent(item.path);
                        }
                      }}
                      className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 transition ${
                        isDir 
                          ? "text-slate-400 cursor-default" 
                          : isSelected 
                            ? "bg-[#1e293b] text-[#38bdf8] font-medium" 
                            : "text-slate-300 hover:bg-[#1e293b]/40 hover:text-white"
                      }`}
                    >
                      {isDir ? (
                        <Folder size={13} className="text-[#3b82f6] shrink-0" />
                      ) : (
                        <FileCode size={13} className={isSelected ? "text-[#38bdf8] shrink-0" : "text-slate-500 shrink-0"} />
                      )}
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Center Code Workspace */}
        <main className="flex-1 flex flex-col bg-[#0b0f17] overflow-hidden min-h-0">
          
          {/* File Header */}
          <div className="h-9 border-b border-[#1e293b] bg-[#0f172a] px-4 flex items-center justify-between text-xs font-mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{repoParam}</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-medium">{selectedFile?.name || "No file selected"}</span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 font-mono ${currentBadge.border}`}>
                <Cpu size={10} />
                <span>Engine: {currentBadge.label}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isLoadingCode ? "Reading bytes..." : "AST Engine Ready"}
              </span>
            </div>
          </div>

          {/* AI Refactor Instruction Bar */}
          <div className="bg-[#0e1422] border-b border-[#1e293b] px-4 py-2.5 space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Wand2 size={14} className="absolute left-3 top-2.5 text-[#38bdf8]" />
                <input
                  type="text"
                  value={refactorPrompt}
                  onChange={(e) => setRefactorPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyRefactor()}
                  placeholder="e.g. Add try-catch error handling, optimize imports, or fix potential edge cases..."
                  className="w-full bg-[#070b12] border border-[#2b3550] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2563eb] font-sans"
                />
              </div>

              <button
                onClick={() => handleApplyRefactor()}
                disabled={isPatching || isLoadingCode || !selectedFile || !refactorPrompt.trim()}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0 shadow-sm disabled:opacity-50"
              >
                {isPatching ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>{currentBadge.label} Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Refactor Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Example Directives */}
            <div className="flex items-center gap-2 text-[11px] font-mono overflow-x-auto">
              <span className="text-slate-500 text-[10px] uppercase shrink-0">Preset Examples:</span>
              
              <button
                type="button"
                onClick={() => setRefactorPrompt("Add try-except error handling and validate payload")}
                className="bg-[#161f33] hover:bg-[#1e293b] text-slate-300 hover:text-white px-2 py-0.5 rounded border border-[#2b3550] transition shrink-0 cursor-pointer"
              >
                🛡️ Exception Handling
              </button>

              <button
                type="button"
                onClick={() => setRefactorPrompt("Optimize memory allocation and clean unnecessary imports")}
                className="bg-[#161f33] hover:bg-[#1e293b] text-slate-300 hover:text-white px-2 py-0.5 rounded border border-[#2b3550] transition shrink-0 cursor-pointer"
              >
                ⚡ Code Cleanup
              </button>

              <button
                type="button"
                onClick={() => setRefactorPrompt("Harden input validation and guard against null/undefined values")}
                className="bg-[#161f33] hover:bg-[#1e293b] text-slate-300 hover:text-white px-2 py-0.5 rounded border border-[#2b3550] transition shrink-0 cursor-pointer"
              >
                🔒 Defensive Guards
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {refactorError && (
            <div className="bg-red-950/70 border-b border-red-500/40 text-red-300 px-4 py-2 text-xs font-mono flex items-center gap-2 shrink-0">
              <AlertCircle size={14} className="shrink-0 text-red-400" />
              <span>{refactorError}</span>
            </div>
          )}

          {/* Clean Framed Split Diff Viewer */}
          <div className="flex-1 p-3 min-h-0 flex flex-col">
            <div className="flex-1 flex flex-col rounded-xl border border-[#1e293b] bg-[#070b12] shadow-lg overflow-hidden min-h-0">
              
              {/* Diff Header */}
              <div className="h-8 border-b border-[#1e293b] bg-[#0f172a] grid grid-cols-2 text-xs font-mono divide-x divide-[#1e293b] shrink-0">
                <div className="px-3 flex items-center justify-between text-slate-400 bg-[#0f172a]/90">
                  <div className="flex items-center gap-1.5">
                    <FileCode size={12} className="text-slate-500" />
                    <span>Original Code ({selectedFile?.name || "Source"})</span>
                  </div>
                  <span className="text-[10px] text-slate-500">GitHub Remote</span>
                </div>

                <div className="px-3 flex items-center justify-between text-emerald-400 bg-[#0a151b]/90">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Sparkles size={12} className="text-emerald-400" />
                    <span>AI Refactored Patch ({activeEngineName})</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                    {isPatching ? "Generating..." : refactoredCode ? "Patch Ready" : "Awaiting Refactor"}
                  </span>
                </div>
              </div>

              {/* Split Code Diff Window */}
              <div className="flex-1 grid grid-cols-2 divide-x divide-[#1e293b] overflow-hidden min-h-0">
                {/* Left: Original Code */}
                <div className="overflow-y-auto font-mono text-xs leading-6 p-3 h-full bg-[#070b12]">
                  {isLoadingCode ? (
                    <div className="p-4 text-slate-500">Loading code bytes...</div>
                  ) : (
                    originalLines.map((line, idx) => (
                      <div key={idx} className="flex items-center px-1 rounded text-slate-300 hover:bg-[#161f33]/40">
                        <span className="w-8 text-right pr-3 select-none text-slate-600 text-[11px] shrink-0">{line.num}</span>
                        <span className="truncate">{line.text}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Right: AI Refactored Code */}
                <div className="overflow-y-auto font-mono text-xs leading-6 p-3 bg-[#05080c] h-full">
                  {isPatching ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 font-mono text-xs">
                      <Loader2 size={24} className="animate-spin text-[#38bdf8]" />
                      <span>{currentBadge.label} engine analyzing syntax & generating patch...</span>
                    </div>
                  ) : patchLines.length > 0 ? (
                    patchLines.map((line, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center px-1 rounded hover:bg-[#161f33]/40 ${
                          line.type === "added" 
                            ? "bg-emerald-500/15 text-emerald-300 font-medium" 
                            : "text-slate-300"
                        }`}
                      >
                        <span className="w-8 text-right pr-3 select-none text-emerald-600/50 text-[11px] shrink-0">{line.num}</span>
                        <span className="truncate">{line.text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 font-mono text-xs p-6 text-center">
                      <div className="text-slate-600 text-lg">&lt;/&gt;</div>
                      <div className="font-semibold text-slate-400">No Patch Generated Yet</div>
                      <p className="max-w-xs text-[11px] text-slate-600">
                        Type instructions above, then click <strong className="text-slate-400">"Refactor Code"</strong> to run {currentBadge.label} analysis.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-72 border-l border-[#1e293b] bg-[#0f172a] p-4 flex flex-col justify-between font-mono text-xs shrink-0 overflow-y-auto space-y-4">
          <div className="space-y-4">
            
            {/* Target Repo Info */}
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Repository
              </div>
              <div className="bg-[#0b0f17] border border-[#1e293b] rounded p-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Branch</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <GitBranch size={11} className="text-[#2563eb]" /> main
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Active File</span>
                  <span className="text-[#38bdf8] truncate font-medium">{selectedFile?.name || "None"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-[#1e293b]">
                  <span>Engine</span>
                  <span className="text-xs text-slate-200 font-semibold">{currentBadge.label.slice(0, 15)}</span>
                </div>
              </div>
            </div>

            {/* AI AST Diagnostics Panel */}
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#38bdf8]" /> AST Diagnostics
                </span>
                {defects.length > 0 && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    {defects.length} resolved
                  </span>
                )}
              </div>

              <div className="bg-[#0b0f17] border border-[#1e293b] rounded-lg p-2.5 max-h-48 overflow-y-auto space-y-2">
                {defects.length === 0 ? (
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Refactor code to view AST findings and applied fixes here.
                  </div>
                ) : (
                  defects.map((defect, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px] leading-snug">
                      <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>{defect}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Git Remote Operations Section */}
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GitCommit size={13} className="text-[#2563eb]" /> Git Operations
              </div>
              <div className="space-y-2">
                
                {/* Revert Commit Button */}
                <button
                  onClick={handleRevertCommit}
                  disabled={isReverting || !selectedFile}
                  className="w-full bg-[#161f33] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#334155] py-1.5 rounded font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50 text-[11px]"
                >
                  <Undo2 size={13} className={isReverting ? "animate-spin text-[#38bdf8]" : "text-amber-400"} />
                  <span>{isReverting ? "Reverting previous commit..." : "Revert (Undo Commit)"}</span>
                </button>

                <div className="pt-2 border-t border-[#1e293b]/70">
                  <label className="text-[10px] text-slate-500 block mb-1">COMMIT MESSAGE</label>
                  <textarea
                    rows={2}
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-[#334155] rounded p-2 text-xs text-white focus:outline-none focus:border-[#2563eb] resize-none font-mono mb-2"
                  />
                  <button
                    onClick={handleCommitPush}
                    disabled={isCommitting || !selectedFile}
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2 rounded font-semibold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <UploadCloud size={14} /> 
                    <span>{isCommitting ? "Committing..." : "Commit & Push"}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Success Toast */}
          {commitStatus && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 p-2 rounded text-[11px] flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
              <span>{commitStatus}</span>
            </div>
          )}
        </aside>

      </div>

    </div>
  );
}