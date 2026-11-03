# ⚡ GitFlow IDE — AI-Powered AST Refactoring & GitFlow Platform

> A full-stack, developer-first AI GitFlow IDE designed for automated code refactoring, AST defect detection, and remote repository synchronization using Next.js 15, Google Gemini, and OpenRouter.

---

## 🚀 Key Features

* **Multi-Model AI Refactor Gateway:**
  * **Direct Google Gemini Engine:** Direct integration with Gemini 2.5 Flash for high-speed AST analysis, input boundary validation, and defensive patching.
  * **OpenRouter Free Tier Gateway:** Dynamic model discovery supporting dedicated coding LLMs (Cohere North Mini Code, Poolside Laguna, Nvidia Nemotron).
  * **Deterministic AST Fallback Engine:** Graceful failover to an embedded AST static analysis compiler if upstream LLM providers hit rate limits or downtime.
* **Side-by-Side Framed Split Diff Viewer:**
  * Real-time side-by-side comparison between original remote repository code and AI-generated defensive patches.
  * Line-by-line syntax addition highlighting and AST defect breakdown.
* **Seamless Git Remote Workflows:**
  * **Commit & Push:** Direct integration with GitHub REST API to commit patches to `main` with automatic local state synchronization.
  * **Revert / Rollback (HEAD~1):** One-click rollback to previous commits with remote tree tracking.
* **Live Audit & Activity Feed:**
  * Comprehensive logging of all refactorings, commits, and rollback operations with commit SHAs and timestamps.
* **Centralized Configuration:**
  * Settings manager for GitHub PAT authentication, target branches, and AI model conventions.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS, Lucide Icons
* **AI Providers:** Google Gemini 2.5 Flash API, OpenRouter API
* **VCS Integration:** GitHub REST API v3
* **Static Analysis:** Custom Abstract Syntax Tree (AST) compiler engine

---

## 🏁 Getting Started

```bash
# 1. Clone the repository
git clone [https://github.com/jagrati22/gitflow-ide.git](https://github.com/jagrati22/gitflow-ide.git)
cd gitflow-ide

# 2. Install dependencies
npm install

# 3. Setup environment variables (add GEMINI_API_KEY, OPENROUTER_API_KEY, GITHUB_ACCESS_TOKEN)
cp .env.example .env.local

# 4. Run the development server
npm run dev