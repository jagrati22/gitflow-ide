import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch models from OpenRouter" },
        { status: res.status }
      );
    }

    const json = await res.json();
    const allModels = json.data || [];

    // Filter only 100% free models
    const freeModels = allModels
      .filter((m: any) => 
        m.id.endsWith(":free") || 
        (m.pricing && Number(m.pricing.prompt) === 0 && Number(m.pricing.completion) === 0)
      )
      .map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        contextLength: m.context_length,
        description: m.description || "Free OpenRouter LLM engine"
      }));

    return NextResponse.json({ success: true, models: freeModels });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}