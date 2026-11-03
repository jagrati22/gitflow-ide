import { NextResponse } from "next/server";

// 1. URL se repo info verify aur fetch karna
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const inputUrl = body?.url;

    if (!inputUrl) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid repository URL" },
        { status: 400 }
      );
    }

    // Clean github URL (e.g. https://github.com/owner/repo -> owner/repo)
    let cleanPath = inputUrl
      .trim()
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\.git$/i, "")
      .replace(/\/$/, "");

    const parts = cleanPath.split("/").filter(Boolean);
    if (parts.length < 2) {
      return NextResponse.json(
        { success: false, error: "Invalid GitHub URL format. Use https://github.com/owner/repo" },
        { status: 400 }
      );
    }

    const owner = parts[0];
    const repo = parts[1];

    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitFlow-IDE"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Fetch repository details from GitHub Public REST API
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      cache: "no-store"
    });

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        return NextResponse.json(
          { success: false, error: `Repository '${owner}/${repo}' not found or is private without token.` },
          { status: 404 }
        );
      }
      if (ghRes.status === 403) {
        return NextResponse.json(
          { success: false, error: "GitHub API rate limit exceeded. Add GITHUB_TOKEN to .env.local" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: `GitHub API responded with status ${ghRes.status}` },
        { status: ghRes.status }
      );
    }

    const data = await ghRes.json();

    const formattedRepo = {
      id: String(data.id || Date.now()),
      name: data.name,
      owner: data.owner?.login || owner,
      fullName: data.full_name || `${owner}/${repo}`,
      branch: data.default_branch || "main",
      stack: data.language || "Multi-language",
      status: "Synced",
      defectsCount: 0,
      lastAudit: "Just connected",
      commits: data.size || 1,
      htmlUrl: data.html_url || `https://github.com/${owner}/${repo}`
    };

    return NextResponse.json({
      success: true,
      repo: formattedRepo
    });

  } catch (error: any) {
    console.error("Backend Error in /api/github/repos:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error while connecting repo" },
      { status: 500 }
    );
  }
}