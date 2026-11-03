import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const repoFullName = searchParams.get("repo");
    const filePath = searchParams.get("path");

    if (!repoFullName) {
      return NextResponse.json(
        { success: false, error: "Repository name is required" },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitFlow-IDE"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 1. Agar specific file ka content chahiye
    if (filePath) {
      const fileRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/${filePath}`,
        { headers, cache: "no-store" }
      );

      if (!fileRes.ok) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch file content" },
          { status: fileRes.status }
        );
      }

      const fileData = await fileRes.json();
      const decodedContent = Buffer.from(fileData.content, "base64").toString("utf-8");

      return NextResponse.json({
        success: true,
        content: decodedContent,
        name: fileData.name,
        path: fileData.path
      });
    }

    // 2. Directory contents (files + folders)
    const repoRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents`,
      { headers, cache: "no-store" }
    );

    if (!repoRes.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to list contents" },
        { status: repoRes.status }
      );
    }

    const contents = await repoRes.json();

    // Folders aur clean files list karna (.DS_Store filter out)
    const items = contents
      .filter((item: any) => item.name !== ".DS_Store" && !item.name.endsWith(".h5"))
      .map((item: any) => ({
        id: item.sha,
        name: item.name,
        path: item.path,
        type: item.type === "dir" ? "dir" : "file",
        size: item.size
      }));

    return NextResponse.json({
      success: true,
      files: items
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}