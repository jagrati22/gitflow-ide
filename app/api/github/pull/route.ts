import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { owner, repo, path, branch = "main", customToken } = await req.json();

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { success: false, error: "owner, repo, and file path are required." },
        { status: 400 }
      );
    }

    const token = customToken || process.env.GITHUB_ACCESS_TOKEN || "";
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "GitFlow-IDE"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 1. Fetch commit history for this specific file (at least 2 commits)
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&sha=${branch}&per_page=2`,
      { headers, cache: "no-store" }
    );

    if (!commitsRes.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch commit history from GitHub." },
        { status: commitsRes.status }
      );
    }

    const commits = await commitsRes.json();

    if (!Array.isArray(commits) || commits.length < 2) {
      return NextResponse.json(
        { success: false, error: "No previous commit found to revert back to." },
        { status: 400 }
      );
    }

    // 2. Previous commit SHA
    const previousCommitSha = commits[1].sha;

    // 3. Get file content from that previous commit
    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${previousCommitSha}`,
      { headers, cache: "no-store" }
    );

    if (!fileRes.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve previous commit file content." },
        { status: fileRes.status }
      );
    }

    const fileData = await fileRes.json();
    const previousContent = Buffer.from(fileData.content, "base64").toString("utf-8");

    // 4. (Optional but clean) Get current file SHA to create a revert commit on remote
    const currentFileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
      { headers, cache: "no-store" }
    );
    const currentFileData = await currentFileRes.json();

    if (token && currentFileData.sha) {
      await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
        {
          method: "PUT",
          headers: {
            ...headers,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: `revert: rolled back ${path} to commit ${previousCommitSha.slice(0, 7)}`,
            content: Buffer.from(previousContent).toString("base64"),
            sha: currentFileData.sha,
            branch: branch
          })
        }
      );
    }

    return NextResponse.json({
      success: true,
      content: previousContent,
      sha: previousCommitSha,
      message: `Reverted to commit ${previousCommitSha.slice(0, 7)}`
    });

  } catch (error: any) {
    console.error("Revert route failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revert commit." },
      { status: 500 }
    );
  }
}