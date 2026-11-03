"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, Key, Cpu, GitBranch, Save, 
  CheckCircle2, ArrowLeft, ShieldCheck, 
  Eye, EyeOff, Globe
} from "lucide-react";

export default function SettingsPage() {
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [aiModel, setAiModel] = useState("gemini");
  const [refactorStrictness, setRefactorStrictness] = useState("balanced");
  const [autoCommitPrefix, setAutoCommitPrefix] = useState("refactor:");
  const [openRouterModel, setOpenRouterModel] = useState("cohere/north-mini-code:free");
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load local preferences
    const savedToken = localStorage.getItem("gitflow_custom_token") || "";
    const savedBranch = localStorage.getItem("gitflow_default_branch") || "main";
    const savedModel = localStorage.getItem("gitflow_selected_model") || "gemini";
    const savedStrictness = localStorage.getItem("gitflow_strictness") || "balanced";
    const savedPrefix = localStorage.getItem("gitflow_commit_prefix") || "refactor:";
    const savedRouterModel = localStorage.getItem("gitflow_openrouter_model") || "cohere/north-mini-code:free";

    setGithubToken(savedToken);
    setDefaultBranch(savedBranch);
    setAiModel(savedModel);
    setRefactorStrictness(savedStrictness);
    setAutoCommitPrefix(savedPrefix);
    setOpenRouterModel(savedRouterModel);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("gitflow_custom_token", githubToken);
    localStorage.setItem("gitflow_default_branch", defaultBranch);
    localStorage.setItem("gitflow_selected_model", aiModel);
    localStorage.setItem("gitflow_ai_model", aiModel);
    localStorage.setItem("gitflow_strictness", refactorStrictness);
    localStorage.setItem("gitflow_commit_prefix", autoCommitPrefix);
    localStorage.setItem("gitflow_openrouter_model", openRouterModel);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/activity" className="hover:text-white transition">Activity</Link>
            <span className="text-white border-b-2 border-[#2563eb] py-4 cursor-default">Settings</span>
          </nav>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-7">
        
        {/* Title */}
        <div className="pb-4 border-b border-[#1e293b] flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Settings size={22} className="text-[#38bdf8]" /> Engine & Environment Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Configure GitHub API credentials, AI LLM endpoints, and remote commit policies.
            </p>
          </div>

          {isSaved && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={13} />
              <span>Settings Saved</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
          
          {/* Card 1: GitHub API Integration */}
          <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Key size={16} className="text-[#2563eb]" />
                <span>GitHub REST Authentication</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                <ShieldCheck size={11} /> Token Active (.env.local)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">PERSONAL ACCESS TOKEN (PAT)</label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_••••••••••••••••••••••••••••••••••••"
                    className="w-full bg-[#0b0f17] border border-[#334155] rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Leave blank to inherit global token from server <code className="text-slate-400">.env.local</code>.
                </p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">DEFAULT TARGET BRANCH</label>
                <input
                  type="text"
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-[#0b0f17] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: AI Multi-Engine Configuration */}
          <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Cpu size={16} className="text-[#38bdf8]" />
                <span>AI Refactor Engines (Multi-Model)</span>
              </div>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                <Globe size={11} /> Gemini + OpenRouter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">DEFAULT ACTIVE MODEL</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-[#0b0f17] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
                >
                  <option value="gemini">Google Gemini 2.5 Flash (Direct API)</option>
                  <option value="cohere/north-mini-code:free">Cohere: North Mini Code (OpenRouter Free)</option>
                  <option value="poolside/laguna-s-2.1:free">Poolside: Laguna S 2.1 (OpenRouter Free)</option>
                  <option value="nvidia/nemotron-3.5-super-vl:free">Nvidia: Nemotron 3.5 (OpenRouter Free)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Can also be toggled directly from Dashboard dropdown.
                </p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">DIAGNOSTICS STRICTNESS</label>
                <select
                  value={refactorStrictness}
                  onChange={(e) => setRefactorStrictness(e.target.value)}
                  className="w-full bg-[#0b0f17] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
                >
                  <option value="conservative">Conservative (Preserve original structure)</option>
                  <option value="balanced">Balanced (Defensive guards + type safety)</option>
                  <option value="aggressive">Aggressive (Complete refactor & modernize)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Git Commit Automation Defaults */}
          <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm pb-3 border-b border-[#1e293b]">
              <GitBranch size={16} className="text-emerald-400" />
              <span>Commit & Patch Conventions</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">COMMIT PREFIX CONVENTION</label>
                <input
                  type="text"
                  value={autoCommitPrefix}
                  onChange={(e) => setAutoCommitPrefix(e.target.value)}
                  placeholder="refactor:"
                  className="w-full bg-[#0b0f17] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard Conventional Commits prefix used when generating automated commit messages.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm text-xs cursor-pointer"
            >
              <Save size={14} />
              <span>Save Configuration</span>
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}