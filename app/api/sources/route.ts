import { NextResponse } from "next/server";

const API_KEY = process.env.WATCHMODE_API_KEY;
const BASE = "https://api.watchmode.com/v1";

// Cache the full sources list for 24 hours (logos don't change often)
export const revalidate = 86400;

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "WatchMode API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE}/sources/?apiKey=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: `WatchMode error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error?.message || "Failed to load providers" },
      { status: 500 }
    );
  }
}
