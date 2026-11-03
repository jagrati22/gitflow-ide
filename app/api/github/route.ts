import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { repo, branch, path, content, message } = await req.json();

    if (!repo || !path || !content) {
      return NextResponse.json(
        { success: false, error: "Repository, file path, and file content are required." },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "GITHUB_TOKEN missing in .env.local" },
        { status: 401 }
      );
    }

    // Clean owner and repo name (e.g. jagrati22/AI-Skin-Disease-Analyzer)
    const cleanRepo = repo.replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "");
    const [owner, repoName] = cleanRepo.includes("/") ? cleanRepo.split("/") : ["jagrati22", cleanRepo];
    const targetBranch = branch || "main";

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitFlow-IDE"
    };

    // 1. Current file ka SHA lana taaki GitHub conflict na kare
    const fileUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${targetBranch}`;
    const fileRes = await fetch(fileUrl, { headers, cache: "no-store" });

    let currentSha: string | null = null;
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      currentSha = fileData.sha;
    }

    // 2. Content ko UTF-8 base64 me encode karna
    const base64Content = Buffer.from(content, "utf-8").toString("base64");

    // 3. GitHub PUT request to commit & push changes
    const commitUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;
    const commitPayload: Record<string, any> = {
      message: message || "refactor: automated AST patches applied via GitFlow IDE",
      content: base64Content,
      branch: targetBranch
    };

    if (currentSha) {
      commitPayload.sha = currentSha;
    }

    const commitRes = await fetch(commitUrl, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commitPayload)
    });

    if (!commitRes.ok) {
      const errData = await commitRes.json();
      console.error("[GitHub Commit API Error]:", errData);
      return NextResponse.json(
        { success: false, error: errData.message || "Failed to push commit to GitHub." },
        { status: commitRes.status }
      );
    }

    const commitResult = await commitRes.json();

    return NextResponse.json({
      success: true,
      commitSha: commitResult.commit?.sha?.substring(0, 7) || "live-push",
      branch: targetBranch
    });

  } catch (error: any) {
    console.error("Internal GitHub Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to commit changes." },
      { status: 500 }
    );
  }
}