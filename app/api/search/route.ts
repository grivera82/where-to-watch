import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.WATCHMODE_API_KEY;
const BASE = "https://api.watchmode.com/v1";

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "WatchMode API key not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ title_results: [] });
  }

  try {
    // Use the name search field for best fuzzy results
    const url =
      `${BASE}/search/?apiKey=${API_KEY}` +
      `&search_field=name&search_value=${encodeURIComponent(query)}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `WatchMode error (${res.status}): ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    // Return only the useful slice to keep payload tiny
    return NextResponse.json({
      title_results: data.title_results || [],
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error?.message || "Search failed" },
      { status: 500 }
    );
  }
}
