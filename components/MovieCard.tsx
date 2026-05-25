"use client";

import { Play, Film, Tv } from "lucide-react";
import type { SearchResult } from "@/lib/types";

interface MovieCardProps {
  item: SearchResult;
  onClick: (item: SearchResult) => void;
}

export default function MovieCard({ item, onClick }: MovieCardProps) {
  const isMovie = item.type === "movie" || item.type === "short_film";
  const hasPoster = !!item.poster;

  return (
    <button
      onClick={() => onClick(item)}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-zinc-800/70 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 active:scale-[0.985]"
    >
      {/* Visual header area */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
        {hasPoster ? (
          <>
            <img
              src={item.poster}
              alt={item.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Subtle bottom gradient for polish */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          /* Fallback + loading state for search results */
          <>
            <div className="absolute inset-0 bg-[radial-gradient(#27272a_0.6px,transparent_1px)] bg-[length:4px_4px] opacity-60" />
            
            {/* Subtle shimmer while poster is being fetched for search results */}
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="relative flex h-full flex-col items-center justify-center gap-3 text-zinc-400 transition-transform duration-300 group-hover:scale-105">
              {isMovie ? (
                <Film className="h-9 w-9" strokeWidth={1.5} />
              ) : (
                <Tv className="h-9 w-9" strokeWidth={1.5} />
              )}
              <div className="font-mono text-[10px] uppercase tracking-[3px] text-zinc-500">
                {isMovie ? "MOVIE" : "SERIES"}
              </div>
            </div>
          </>
        )}

        {/* Play affordance on hover */}
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-all group-hover:opacity-100">
          <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <div className="line-clamp-2 text-[14px] font-semibold leading-tight text-white sm:text-[15px]">
            {item.name}
          </div>
          {item.year && (
            <div className="mt-0.5 text-[10px] text-zinc-400 sm:mt-1 sm:text-xs">{item.year}</div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] sm:mt-3 sm:text-[11px]">
          <div className="rounded-full border border-white/10 px-2 py-px text-zinc-400 sm:px-2.5">
            {item.type.replace("_", " ")}
          </div>
          <div className="font-mono text-[9px] text-indigo-400/70 group-hover:text-indigo-400 sm:text-[10px]">
            SEE MORE →
          </div>
        </div>
      </div>
    </button>
  );
}
