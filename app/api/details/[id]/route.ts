import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.WATCHMODE_API_KEY;
const BASE = "https://api.watchmode.com/v1";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "WatchMode API key not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const titleId = parseInt(id, 10);

  if (!titleId || isNaN(titleId)) {
    return NextResponse.json({ error: "Invalid title id" }, { status: 400 });
  }

  try {
    // Append sources so we get the full streaming availability in one call
    const url =
      `${BASE}/title/${titleId}/details/` +
      `?apiKey=${API_KEY}&append_to_response=sources`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `WatchMode error (${res.status}): ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Optional: filter sources to US only on the server (keeps client clean)
    if (data.sources && Array.isArray(data.sources)) {
      data.sources = data.sources.filter(
        (s: { region?: string }) => !s.region || s.region.toUpperCase() === "US"
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error?.message || "Failed to load title details" },
      { status: 500 }
    );
  }
}
