"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, User, FolderGit2, GitBranch, Sparkles, 
  Clock, ArrowUpRight, Plus, AlertCircle, CheckCircle2, 
  ExternalLink, Trash2, ShieldAlert, Cpu, ChevronDown, Loader2
} from "lucide-react";

interface RepoItem {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  branch: string;
  stack: string;
  status: string;
  defectsCount: number;
  lastAudit: string;
  commits: number;
  htmlUrl: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  contextLength: number;
  description: string;
}

export default function DashboardPage() {
  const [repositories, setRepositories] = useState<RepoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Dynamic OpenRouter Models state
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gemini");

  // 1. Fetch dynamic free models from our API route
  useEffect(() => {
    async function fetchFreeModels() {
      try {
        setLoadingModels(true);
        const res = await fetch("/api/openrouter/models");
        const data = await res.json();
        
        if (data.success && data.models && data.models.length > 0) {
          // Add default direct Gemini option at top, followed by live OpenRouter free models
          const combined = [
            {
              id: "gemini",
              name: "Google Gemini 1.5 Flash (Direct API)",
              contextLength: 1048576,
              description: "Primary AST syntax analyzer & fast patch generation"
            },
            ...data.models
          ];
          setAvailableModels(combined);

          const savedModel = localStorage.getItem("gitflow_selected_model");
          if (savedModel && combined.some((m: OpenRouterModel) => m.id === savedModel)) {
            setSelectedModel(savedModel);
          } else {
            setSelectedModel("gemini");
            localStorage.setItem("gitflow_selected_model", "gemini");
          }
        }
      } catch (err) {
        console.error("Failed to load models:", err);
      } finally {
        setLoadingModels(false);
      }
    }

    fetchFreeModels();
  }, []);

  // 2. Load connected repos
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gitflow_connected_repos");
      if (saved) {
        setRepositories(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse local data", e);
    }
  }, []);

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem("gitflow_selected_model", modelId);
    const chosen = availableModels.find(m => m.id === modelId);
    setSuccessMsg(`Active refactor engine switched to ${chosen?.name || modelId}`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const saveRepos = (newRepos: RepoItem[]) => {
    setRepositories(newRepos);
    localStorage.setItem("gitflow_connected_repos", JSON.stringify(newRepos));
  };

  const handleConnectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const targetUrl = newRepoUrl.trim();
    if (!targetUrl) {
      setErrorMsg("Please enter a GitHub repository URL.");
      return;
    }

    setIsConnecting(true);

    try {
      const res = await fetch("/api/github/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });

      const data = await res.json();

      if (data.success && data.repo) {
        const alreadyExists = repositories.some(
          (r) => r.fullName.toLowerCase() === data.repo.fullName.toLowerCase()
        );

        if (alreadyExists) {
          setErrorMsg(`Repository '${data.repo.fullName}' is already connected.`);
        } else {
          saveRepos([data.repo, ...repositories]);
          setNewRepoUrl("");
          setSuccessMsg(`Successfully connected ${data.repo.fullName}!`);
          setTimeout(() => setSuccessMsg(""), 3500);
        }
      } else {
        setErrorMsg(data.error || "Failed to verify repository with GitHub API.");
      }
    } catch (err: any) {
      console.error("Connect repo error:", err);
      setErrorMsg("Network error connecting to API. Verify Next.js dev server is running.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemoveRepo = (id: string) => {
    const updated = repositories.filter((r) => r.id !== id);
    saveRepos(updated);
  };

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.stack.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeModelDetails = availableModels.find(m => m.id === selectedModel) || {
    id: "gemini",
    name: "Google Gemini 1.5 Flash (Direct API)",
    description: "Primary AST syntax analyzer"
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-[#c9d1d9] font-sans flex flex-col select-none">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-14 border-b border-[#1e293b] bg-[#0f172a] px-8 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:bg-[#1d4ed8] transition">
              ⚡
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">GitFlow IDE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
            <span className="text-white border-b-2 border-[#2563eb] py-4 cursor-default">Dashboard</span>
            <Link href="/activity" className="hover:text-white transition">Activity</Link>
            <Link href="/settings" className="hover:text-white transition">Settings</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#1e293b] px-3 py-1.5 rounded-md border border-[#334155]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <User size={13} className="text-[#2563eb]" />
            <span className="font-mono text-xs">Developer Session</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-8 py-8 space-y-7">
        
        {/* Header & Quick Connect URL Box */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1e293b]">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Repository Workspace</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Paste any GitHub repository link to inspect AST syntax, run AI diagnostics, and push patches.
            </p>
          </div>

          <form onSubmit={handleConnectRepo} className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg p-1.5 w-full md:w-[460px] shadow-sm">
            <FolderGit2 size={15} className="text-slate-500 ml-2 shrink-0" />
            <input
              type="text"
              value={newRepoUrl}
              onChange={(e) => setNewRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none flex-1 font-mono px-1"
            />
            <button
              type="submit"
              disabled={isConnecting}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs px-3.5 py-1.5 rounded-md font-medium transition flex items-center gap-1 shrink-0 shadow-sm disabled:opacity-50"
            >
              <Plus size={13} /> {isConnecting ? "Connecting..." : "Connect"}
            </button>
          </form>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono rounded-lg flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono rounded-lg flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* DYNAMIC OPENROUTER AI ENGINE SELECTOR CARD */}
        <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider font-mono">
                <Cpu size={15} className="text-[#38bdf8]" />
                <span>AI Refactor Engine (OpenRouter Live Gateway)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  {availableModels.length} Models Available
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans truncate">
                {activeModelDetails.description || "Active dynamic refactor LLM"}
              </p>
            </div>

            {/* Custom Modern Dropdown */}
            <div className="relative min-w-[320px]">
              {loadingModels ? (
                <div className="flex items-center gap-2 bg-[#0b0f17] border border-[#334155] text-slate-400 text-xs font-mono rounded-lg px-3.5 py-2.5">
                  <Loader2 size={14} className="animate-spin text-[#38bdf8]" />
                  <span>Loading live free models...</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => handleSelectModel(e.target.value)}
                    className="w-full appearance-none bg-[#0b0f17] border border-[#334155] hover:border-[#2563eb] text-white text-xs font-mono rounded-lg px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-[#2563eb] cursor-pointer shadow-sm transition"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id} className="bg-[#0f172a] text-white py-1">
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="p-4.5 rounded-xl border border-[#1e293b] bg-[#0f172a] shadow-sm">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>CONNECTED REPOSITORIES</span>
              <FolderGit2 size={16} className="text-[#2563eb]" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{repositories.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>●</span> Ready for IDE workspace
            </div>
          </div>

          <div className="p-4.5 rounded-xl border border-[#1e293b] bg-[#0f172a] shadow-sm">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>TARGET BRANCHES</span>
              <GitBranch size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">{repositories.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Default tracked branches</div>
          </div>

          <div className="p-4.5 rounded-xl border border-[#1e293b] bg-[#0f172a] shadow-sm">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>SECURITY DIAGNOSTICS</span>
              <ShieldAlert size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-2">Active</div>
            <div className="text-[11px] text-slate-400 mt-1">AST audit on demand</div>
          </div>

          <div className="p-4.5 rounded-xl border border-[#1e293b] bg-[#0f172a] shadow-sm">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>ACTIVE LLM ENGINE</span>
              <Sparkles size={16} className="text-[#38bdf8]" />
            </div>
            <div className="text-sm font-bold text-[#38bdf8] mt-2 truncate">
              {activeModelDetails.name.split(" ")[0]}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              {activeModelDetails.id === "gemini" ? "Direct Google API" : "Live Free Gateway"}
            </div>
          </div>
        </div>

        {/* Repositories Table Card */}
        <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Indexed Repositories
              </span>
              <span className="text-[11px] bg-[#1e293b] text-slate-400 border border-[#334155] px-2 py-0.5 rounded font-mono">
                {filteredRepos.length}
              </span>
            </div>

            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter connected repos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0b0f17] border border-[#334155] rounded-md pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2563eb] w-56 font-mono"
              />
            </div>
          </div>

          {filteredRepos.length === 0 ? (
            <div className="p-16 text-center text-xs font-mono text-slate-400 space-y-3">
              <FolderGit2 size={32} className="mx-auto text-slate-600" />
              <div className="text-slate-300 font-semibold text-sm">No repositories connected yet</div>
              <p className="max-w-md mx-auto text-slate-500 text-[11px]">
                Enter any public or private GitHub repository link in the box above (e.g. <code className="text-slate-400">https://github.com/owner/repo</code>) to load it into GitFlow IDE.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1e293b] font-mono text-xs">
              {filteredRepos.map((repo) => (
                <div 
                  key={repo.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1e293b]/40 transition group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{repo.owner} /</span>
                      <Link 
                        href={`/studio?repo=${encodeURIComponent(repo.fullName)}`}
                        className="text-white group-hover:text-[#38bdf8] font-semibold text-sm transition tracking-tight"
                      >
                        {repo.name}
                      </Link>
                      <span className="bg-[#1e293b] text-slate-300 text-[10px] px-1.5 py-0.5 rounded border border-[#334155] flex items-center gap-1">
                        <GitBranch size={10} className="text-[#2563eb]" /> {repo.branch}
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px] flex items-center gap-3">
                      <span className="text-[#38bdf8]">{repo.stack}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={11} /> {repo.lastAudit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {repo.htmlUrl && (
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#0b0f17] border border-[#334155] text-slate-400 hover:text-white transition"
                        title="View on GitHub"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}

                    <button
                      onClick={() => handleRemoveRepo(repo.id)}
                      className="p-1.5 rounded-lg bg-[#0b0f17] border border-[#334155] text-slate-500 hover:text-red-400 transition"
                      title="Remove from Workspace"
                    >
                      <Trash2 size={13} />
                    </button>

                    <Link
                      href={`/studio?repo=${encodeURIComponent(repo.fullName)}`}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3.5 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Open in Studio</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}