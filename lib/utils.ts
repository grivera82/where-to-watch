import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Source, GroupedSources } from "./types";

// Standard shadcn-style cn utility (we bring the tiny deps inline via this file)
export function cn(...inputs: ClassValue[]) {
  // We will install clsx + tailwind-merge in the next step if not present
  // For now this is a placeholder that works once installed
  return twMerge(clsx(inputs));
}

// Simple debounce (no extra deps)
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => unknown,
  delay: number
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Group streaming sources into the four buckets we show in the modal
export function groupSourcesByType(sources: Source[] = []): GroupedSources {
  const groups: GroupedSources = {
    subscription: [],
    free: [],
    rent: [],
    buy: [],
  };

  for (const s of sources) {
    // Only keep US results for v1 (easy to relax later)
    if (s.region && s.region.toUpperCase() !== "US") continue;

    if (s.type === "sub" || s.type === "addon") {
      groups.subscription.push(s);
    } else if (s.type === "free") {
      groups.free.push(s);
    } else if (s.type === "rent") {
      groups.rent.push(s);
    } else if (s.type === "buy") {
      groups.buy.push(s);
    }
  }

  // Sort each bucket alphabetically by provider name for stable UI
  (Object.keys(groups) as (keyof GroupedSources)[]).forEach((key) => {
    groups[key].sort((a, b) => a.name.localeCompare(b.name));
  });

  return groups;
}

// Human readable runtime
export function formatRuntime(minutes?: number): string {
  if (!minutes || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Small helper for year display
export function formatYear(year?: number, endYear?: number): string {
  if (!year) return "";
  if (endYear && endYear !== year) return `${year}–${endYear}`;
  return String(year);
}

// Very small abortable fetch wrapper (used in page for search)
export async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}
