"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Key, ArrowRight, 
  Loader2, AlertCircle, CheckCircle2, Lock, User, ShieldCheck
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [customToken, setCustomToken] = useState("");
  const [useServerToken, setUseServerToken] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          token: useServerToken ? "" : customToken.trim()
        })
      });

      const data = await res.json();

      if (data.success && data.user) {
        setLoginSuccess(true);
        localStorage.setItem("gitflow_user", JSON.stringify(data.user));

        if (!useServerToken && customToken) {
          localStorage.setItem("gitflow_custom_token", customToken.trim());
        }

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setErrorMsg(data.error || "GitHub authentication failed. Please check credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reach authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-[#c9d1d9] font-sans flex flex-col justify-center items-center px-4 select-none">
      
      {/* Background Radial Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#2563eb] mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">GitFlow IDE</h1>
          <p className="text-xs text-slate-400 font-mono">
            Connect to GitHub REST Engine to unlock live AST refactoring and remote repository commits.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs font-mono flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {loginSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>Authenticated successfully! Redirecting...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-slate-400 flex items-center gap-1.5">
              <User size={13} className="text-[#38bdf8]" /> GITHUB USERNAME
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jagrati22 or your GitHub handle"
              className="w-full bg-[#0b0f17] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* Toggle Server Token */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0b0f17] border border-[#1e293b]">
            <div>
              <div className="text-white font-medium text-[11px]">Use Server Environment Token</div>
              <div className="text-[10px] text-slate-500">Auto-authenticates via .env.local token</div>
            </div>
            <input
              type="checkbox"
              checked={useServerToken}
              onChange={(e) => setUseServerToken(e.target.checked)}
              className="accent-[#2563eb] cursor-pointer h-4 w-4"
            />
          </div>

          {/* Optional Custom Token */}
          {!useServerToken && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-slate-400 flex items-center gap-1.5">
                <Key size={13} className="text-emerald-400" /> PERSONAL ACCESS TOKEN (PAT)
              </label>
              <input
                type="password"
                required={!useServerToken}
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="ghp_••••••••••••••••••••••••••••••••••••"
                className="w-full bg-[#0b0f17] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2563eb]"
              />
              <p className="text-[10px] text-slate-500">Requires repo or public_repo scope for remote operations.</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Verifying with GitHub...</span>
              </>
            ) : loginSuccess ? (
              <>
                <CheckCircle2 size={15} />
                <span>Access Granted</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Sign in with GitHub</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badges */}
        <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Lock size={11} className="text-emerald-400" /> SSL Encrypted
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-[#38bdf8]" /> REST v3 Verified
          </span>
        </div>

      </div>

      <Link href="/" className="mt-6 text-xs text-slate-500 hover:text-white transition font-mono">
        ← Return to Landing Page
      </Link>
    </div>
  );
}