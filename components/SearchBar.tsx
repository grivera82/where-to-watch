"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onClear, isLoading, placeholder = "Search movies or TV shows…" }, ref) => {
    return (
      <div className="relative w-full">
        <div className="pointer-events-none absolute left-5 top-4 text-zinc-400">
          <Search className="h-5 w-5" />
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-900/70 pl-12 pr-14 text-lg placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          autoComplete="off"
          spellCheck={false}
        />

        {value && (
          <button
            onClick={onClear}
            className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {isLoading && (
          <div className="absolute right-5 top-4 text-xs text-indigo-400">searching…</div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
export default SearchBar;
