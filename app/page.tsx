"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, FolderOpen, FileCode, GitBranch, 
  ChevronDown, Terminal, LogIn
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-800 font-sans flex flex-col relative overflow-hidden select-none">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-14 bg-[#111622] text-[#c9d1d9] px-8 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            ⚡
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">GitFlow IDE</span>
          <span className="text-[10px] text-slate-400 border border-[#2b3550] bg-[#1b2234] px-2 py-0.5 rounded-full font-mono">
            RepoLens Core
          </span>
        </div>

        {/* Top Right Login Link */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link
            href="/login"
            className="text-slate-300 hover:text-white transition flex items-center gap-1.5 bg-[#1b2234] border border-[#2b3550] px-3.5 py-1.5 rounded-md"
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Soft Blue Curved Glow in Background */}
      <div className="absolute top-14 right-0 w-[55%] h-[85%] bg-[#dbeafe] rounded-bl-[160px] pointer-events-none z-0" />

      {/* 2. MAIN HERO SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-10 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column: Heading + Direct Login Action */}
        <div className="lg:col-span-5 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.18]">
            Web based code editor and repository
          </h1>

          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-md">
            Web-based cloud code editor and repository management platform for continuous inspection, automated defect audits, and 1-click Git commits.
          </p>

          {/* MAIN BUTTON: Ab ye seedha /login kholega */}
          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/login"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-6 py-3 rounded-lg shadow-md transition flex items-center gap-2"
            >
              <span>Login to GitFlow</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Column: Floating Dark IDE Window Mockup */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-[620px] bg-[#0d1117] text-[#c9d1d9] rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-[#30363d] overflow-hidden font-mono text-xs">
            
            {/* Window Top Controls */}
            <div className="h-8 bg-[#161b22] border-b border-[#21262d] px-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block"></span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans font-medium">GitFlow IDE</span>
              <div className="w-10"></div>
            </div>

            {/* Sub-header inside Editor */}
            <div className="h-9 bg-[#0d1117] border-b border-[#21262d] px-4 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-sans">username /</span>
                <span className="text-white font-semibold font-sans">project-alpha</span>
                <span className="ml-2 bg-[#21262d] text-slate-300 px-1.5 py-0.5 rounded border border-[#334155] text-[10px] flex items-center gap-1">
                  <GitBranch size={10} className="text-[#3b82f6]" /> main
                </span>
              </div>
              <span className="text-slate-500 text-[10px] font-sans">Last commit: 3 min ago</span>
            </div>

            {/* Inner IDE Layout */}
            <div className="grid grid-cols-12 min-h-[300px] divide-x divide-[#21262d]">
              <div className="col-span-4 bg-[#0d1117] p-2 space-y-1 text-[11px]">
                <div className="text-[10px] text-slate-500 uppercase px-1 font-semibold mb-1">Explorer</div>
                <div className="flex items-center gap-1 text-slate-300 py-0.5 px-1 font-semibold">
                  <ChevronDown size={12} />
                  <FolderOpen size={12} className="text-[#3b82f6]" />
                  <span>src / components</span>
                </div>
                <div className="ml-3 pl-1.5 border-l border-[#21262d] space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[#58a6ff] bg-[#161b22] px-1.5 py-1 rounded">
                    <FileCode size={11} />
                    <span>App.js</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 px-1.5 py-0.5">
                    <FileCode size={11} />
                    <span>index.html</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 px-1.5 py-0.5">
                    <FileCode size={11} />
                    <span>README.md</span>
                  </div>
                </div>
              </div>

              <div className="col-span-8 bg-[#090d16] flex flex-col justify-between">
                <div className="p-3 text-[11px] leading-relaxed text-slate-300 overflow-hidden font-mono">
                  <div><span className="text-[#ff7b72]">import</span> React, &#123; useState &#125; <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'react'</span>;</div>
                  <div className="mt-2"><span className="text-[#ff7b72]">function</span> <span className="text-[#d2a8ff]">App</span>() &#123;</div>
                  <div className="pl-3"><span className="text-[#ff7b72]">const</span> [state] = <span className="text-[#79c0ff]">useState</span>(<span className="text-[#a5d6ff]">'react'</span>);</div>
                  <div className="pl-3"><span className="text-[#ff7b72]">return</span> (</div>
                  <div className="pl-6 text-[#7ee787]">&lt;div className="app"&gt;</div>
                  <div className="pl-8 text-white">&lt;h1&gt;GitFlow IDE&lt;/h1&gt;</div>
                  <div className="pl-6 text-[#7ee787]">&lt;/div&gt;</div>
                  <div className="pl-3">);</div>
                  <div>&#125;</div>
                </div>

                <div className="border-t border-[#21262d] bg-[#0d1117] px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Terminal size={10} className="text-[#3b82f6]" /> Terminal: Ready
                  </span>
                  <span>UTF-8</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}