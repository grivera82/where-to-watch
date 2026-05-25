"use client";

import { ExternalLink } from "lucide-react";
import type { Source } from "@/lib/types";

interface SourcePillProps {
  source: Source;
  logoUrl?: string;
}

export default function SourcePill({ source, logoUrl }: SourcePillProps) {
  const price =
    typeof source.price === "number"
      ? `$${source.price.toFixed(2)}`
      : source.price || null;

  const handleClick = () => {
    window.open(source.web_url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-3 text-left transition hover:border-white/25 hover:bg-zinc-800/70 active:scale-[0.985]"
    >
      {/* Logo or fallback badge */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="h-6 w-6 object-contain"
            onError={(e) => {
              // Graceful fallback if logo fails
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="font-mono text-[9px] font-semibold text-zinc-400">
            {source.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <div className="truncate text-[13px] font-semibold text-white">
            {source.name}
          </div>
          {source.format && (
            <div className="rounded bg-white/5 px-1.5 py-px text-[9px] text-zinc-400">
              {source.format}
            </div>
          )}
        </div>
        <div className="text-[11px] text-zinc-400">
          {source.type === "sub" && "Stream with subscription"}
          {source.type === "free" && "Free with ads / legal"}
          {source.type === "rent" && (price ? `Rent — ${price}` : "Rent")}
          {source.type === "buy" && (price ? `Buy — ${price}` : "Buy")}
          {source.type === "addon" && "Add-on channel"}
        </div>
      </div>

      <div className="flex items-center gap-1 text-indigo-400/70 transition group-hover:text-indigo-400">
        <span className="text-xs font-medium">WATCH</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}
