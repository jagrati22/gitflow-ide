"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GitCommit, Sparkles, ArrowLeft, Clock, 
  CheckCircle2, RefreshCw, Trash2, Activity, Undo2
} from "lucide-react";
import { getActivities, ActivityItem } from "@/app/lib/activityLogger";

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  const loadData = () => {
    setActivities(getActivities());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gitflow_live_activities");
      setActivities([]);
    }
  };

  const isRevertItem = (act: ActivityItem) => {
    return act.type === ("pull" as any) || (act.description && act.description.toLowerCase().includes("revert"));
  };

  const filtered = activities.filter((act) => {
    if (filterType === "all") return true;
    if (filterType === "revert") return isRevertItem(act);
    if (filterType === "commit") return act.type === "commit" && !isRevertItem(act);
    if (filterType === "refactor") return act.type === "refactor";
    return act.type === filterType;
  });

  return (
    <div className="min-h-screen bg-[#0b0f17] text-[#c9d1d9] font-sans flex flex-col select-none">
      
      {/* Top Navbar */}
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
            <span className="text-white border-b-2 border-[#2563eb] py-4 cursor-default">Activity</span>
            <Link href="/settings" className="hover:text-white transition">Settings</Link>
          </nav>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft size={13} /> Return to Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity size={22} className="text-[#38bdf8]" /> Live Audit & Activity Feed
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Live audit logs of AST patches, AI refactoring triggers, and remote GitHub commits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="bg-[#161f33] hover:bg-[#1e293b] text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-[#334155] font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw size={12} /> Refresh
            </button>
            {activities.length > 0 && (
              <button
                onClick={handleClear}
                className="bg-[#161f33] hover:bg-red-950/40 text-slate-400 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-[#334155] hover:border-red-500/30 font-mono flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 size={12} /> Clear Logs
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto pb-1">
          <span className="text-slate-500 text-[11px] shrink-0">FILTER:</span>
          {[
            { id: "all", label: "All Logs" },
            { id: "refactor", label: "AI Refactors" },
            { id: "commit", label: "GitHub Commits" },
            { id: "revert", label: "Git Reverts" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-md capitalize transition shrink-0 cursor-pointer ${
                filterType === tab.id
                  ? "bg-[#2563eb] text-white font-medium shadow-sm"
                  : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-slate-500 text-[11px] shrink-0">
            {filtered.length} Recorded Events
          </span>
        </div>

        {/* Feed List */}
        <div className="space-y-3 font-mono">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-12 text-center space-y-2">
              <Clock size={28} className="mx-auto text-slate-600" />
              <div className="text-white text-sm font-semibold">No activity matching filter</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Open Studio and trigger an AI refactor, push a commit, or revert to see live logs.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isRevert = isRevertItem(item);
              const isCommit = item.type === "commit" && !isRevert;
              const isRefactor = item.type === "refactor";

              const badgeDetails = isRevert
                ? {
                    title: "Git Revert / Rollback",
                    boxClass: "bg-amber-950/40 text-amber-400 border-amber-500/20",
                    icon: <Undo2 size={15} />
                  }
                : isCommit
                ? {
                    title: "GitHub Remote Push",
                    boxClass: "bg-purple-950/50 text-purple-400 border-purple-500/20",
                    icon: <GitCommit size={15} />
                  }
                : {
                    title: "AI Refactor Generated",
                    boxClass: "bg-blue-950/50 text-[#38bdf8] border-blue-500/20",
                    icon: <Sparkles size={15} />
                  };

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#334155] transition shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${badgeDetails.boxClass}`}>
                      {badgeDetails.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white">
                          {badgeDetails.title}
                        </span>
                        {item.sha && (
                          <span className="bg-[#1e293b] text-slate-300 text-[10px] px-1.5 py-0.2 rounded border border-[#334155]">
                            SHA: {item.sha.length > 7 ? item.sha.slice(0, 7) : item.sha}
                          </span>
                        )}
                        <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">{item.description}</div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="text-slate-400">{item.repo}</span>
                        {item.file && (
                          <>
                            <span>/</span>
                            <span className="text-[#38bdf8]">{item.file}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1">
                      <Clock size={11} /> {item.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}