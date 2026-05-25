"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { SearchResult, TitleDetails, Provider } from "@/lib/types";
import { debounce, fetchJSON } from "@/lib/utils";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import DetailModal from "@/components/DetailModal";

// === Seeded Popular Titles (real WatchMode IDs, zero API calls on load) ===
// Posters are included so the Popular grid looks great (fetched once during development)
const POPULAR_SEED: SearchResult[] = [
  {
    id: 1644435,
    name: "Dune: Part Two",
    year: 2024,
    type: "movie",
    poster: "https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  },
  {
    id: 538646,
    name: "Shōgun",
    year: 2024,
    type: "tv_series",
    poster: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
  },
  {
    id: 1643798,
    name: "Oppenheimer",
    year: 2023,
    type: "movie",
    poster: "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  },
  {
    id: 1496273,
    name: "Dune: Part One",
    year: 2021,
    type: "movie",
    poster: "https://image.tmdb.org/t/p/w780/gDzOcq0pfeCeqMBwKIJlSmQpjkZ.jpg",
  },
  {
    id: 3173903,
    name: "Breaking Bad",
    year: 2008,
    type: "tv_series",
    poster: "https://image.tmdb.org/t/p/w780/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
  },
  {
    id: 3184679,
    name: "The Bear",
    year: 2022,
    type: "tv_series",
    poster: "https://image.tmdb.org/t/p/w780/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg",
  },
];

export default function Where2Watch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Provider logos (fetched once)
  const [providers, setProviders] = useState<Map<number, Provider>>(new Map());

  const searchAbortRef = useRef<AbortController | null>(null);

  // Load provider logos once on mount (cached on server for 24h)
  useEffect(() => {
    fetchJSON<Provider[]>("/api/sources")
      .then((data) => {
        const map = new Map<number, Provider>();
        if (Array.isArray(data)) {
          data.forEach((p) => map.set(p.id, p));
        }
        setProviders(map);
      })
      .catch(() => {
        // Non-fatal — the modal will gracefully fall back to text badges
      });
  }, []);

  // Core search logic (stable)
  const performSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setIsSearching(true);
    setSearchError(null);

    try {
      const data = await fetchJSON<{ title_results: SearchResult[] }>(
        `/api/search?q=${encodeURIComponent(q)}`,
        controller.signal
      );
      setResults(data.title_results || []);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name !== "AbortError") {
        setSearchError("Search failed. Please try again.");
        setResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Stable debounced wrapper (created once, never recreated)
  // eslint-disable-next-line react-hooks/refs
  const debouncedSearch = useMemo(() => debounce(performSearch, 320), [performSearch]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    debouncedSearch(val);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchError(null);
    searchAbortRef.current?.abort();
  };

  // Also fix the last any in the file (openTitle catch)
  // (we'll do a broader cleanup in the next replace)

  // Open modal + fetch full details + sources
  const openTitle = async (item: SearchResult) => {
    setSelected(item);
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const data = await fetchJSON<TitleDetails>(`/api/details/${item.id}`);
      setDetails(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setDetailsError(error?.message || "Could not load details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setDetails(null);
    setDetailsError(null);
    setDetailsLoading(false);
  };

  // Keyboard: press "/" focuses search (when not typing elsewhere)
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // "I'm feeling lucky" — pick a random popular title
  const feelLucky = () => {
    const random = POPULAR_SEED[Math.floor(Math.random() * POPULAR_SEED.length)];
    openTitle(random);
  };

  const displayItems = query.trim().length >= 2 ? results : POPULAR_SEED;
  const showingPopular = query.trim().length < 2;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      {/* Subtle top nav */}
      <nav className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold tracking-tighter">where2watch</div>
              <div className="text-[10px] text-white/40 -mt-0.5">powered by Watchmode</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={feelLucky}
              className="hidden items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-white/5 hover:text-white md:flex"
            >
              <Sparkles className="h-3.5 w-3.5" /> I’m feeling lucky
            </button>
            <a
              href="https://api.watchmode.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/50 hover:text-white/80"
            >
              API
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            REAL-TIME STREAMING AVAILABILITY
          </div>
          <h1 className="mt-4 text-6xl font-semibold tracking-tighter md:text-7xl">
            Find where to<br />watch anything.
          </h1>
          <p className="mt-4 text-xl text-white/70">
            Instant search across thousands of movies and TV shows.
            See every legal streaming, rental, and purchase option in the US.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 max-w-xl">
          <SearchBar
            ref={searchInputRef}
            value={query}
            onChange={handleQueryChange}
            onClear={clearSearch}
            isLoading={isSearching}
            placeholder="Search Dune, Shōgun, The Bear…"
          />
          <div className="mt-2 text-[10px] text-white/40">
            Press <kbd className="rounded bg-white/10 px-1">/</kbd> to search •{" "}
            <kbd className="rounded bg-white/10 px-1">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Results / Popular section */}
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-sm font-medium text-white/60">
              {showingPopular ? "POPULAR RIGHT NOW" : "SEARCH RESULTS"}
            </div>
            {!showingPopular && results.length > 0 && (
              <div className="text-xs text-white/40">
                {results.length} titles for “{query}”
              </div>
            )}
          </div>

          {showingPopular && (
            <button
              onClick={feelLucky}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 md:hidden"
            >
              <Sparkles className="h-3.5 w-3.5" /> Surprise me
            </button>
          )}
        </div>

        {/* Grid */}
        {searchError && (
          <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300">
            {searchError}
          </div>
        )}

        {!searchError && displayItems.length === 0 && query.length >= 2 && !isSearching && (
          <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-10 text-center">
            <div className="text-white/60">No results found for “{query}”.</div>
            <div className="mt-1 text-xs text-white/40">Try a different spelling or title.</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {displayItems.map((item) => (
            <MovieCard key={item.id} item={item} onClick={openTitle} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-[11px] text-white/30">
          Availability data from Watchmode • US region • Links open official sources
        </div>
      </div>

      {/* Rich Detail Modal */}
      <DetailModal
        item={selected}
        details={details}
        isLoading={detailsLoading}
        error={detailsError}
        providers={providers}
        onClose={closeModal}
      />
    </div>
  );
}
