import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, token } = await req.json();

    // User ka token ya fir .env.local ka server token
    const authToken = token || process.env.GITHUB_TOKEN;

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: "GitHub token missing in environment." },
        { status: 400 }
      );
    }

    // Real GitHub User API check
    const ghRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GitFlow-IDE"
      },
      cache: "no-store"
    });

    if (!ghRes.ok) {
      return NextResponse.json(
        { success: false, error: "Invalid GitHub credentials or token expired." },
        { status: 401 }
      );
    }

    const userData = await ghRes.json();

    // Check username match if given
    if (username && userData.login.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: `Authenticated token belongs to '${userData.login}', not '${username}'.` },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        public_repos: userData.public_repos
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentication service failed." },
      { status: 500 }
    );
  }
}