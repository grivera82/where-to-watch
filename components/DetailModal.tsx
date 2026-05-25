"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, ExternalLink } from "lucide-react";
import type { SearchResult, TitleDetails, Provider } from "@/lib/types";
import { groupSourcesByType, formatRuntime, formatYear } from "@/lib/utils";
import SourcePill from "./SourcePill";

interface DetailModalProps {
  item: SearchResult | null;
  details: TitleDetails | null;
  isLoading: boolean;
  error: string | null;
  providers: Map<number, Provider>;
  onClose: () => void;
}

export default function DetailModal({
  item,
  details,
  isLoading,
  error,
  providers,
  onClose,
}: DetailModalProps) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll when modal is open (prevents background scrolling on mobile)
  useEffect(() => {
    if (!item) return;

    const scrollY = window.scrollY;

    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // Restore scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [item]);

  if (!item) return null;

  const grouped = details ? groupSourcesByType(details.sources) : null;
  const hasAnySources =
    grouped &&
    (grouped.subscription.length ||
      grouped.free.length ||
      grouped.rent.length ||
      grouped.buy.length);

  const poster = details?.posterLarge || details?.posterMedium || details?.poster;
  const yearDisplay = formatYear(details?.year, details?.end_year);
  const runtime = formatRuntime(details?.runtime_minutes);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
        >
          {/* Close button - bigger + better positioned on mobile */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-white/85 backdrop-blur-sm transition active:bg-black/90 md:right-4 md:top-4 md:h-9 md:w-9"
            aria-label="Close"
          >
            <X className="h-5 w-5 md:h-4 md:w-4" />
          </button>

          {/* Hero image area (stays fixed while content below scrolls) */}
          <div className="relative h-56 w-full flex-shrink-0 bg-zinc-900 md:h-72">
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_0.8px,transparent_1px)] bg-[length:4px_4px]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-zinc-950" />

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <h2 className="text-2xl font-semibold tracking-tighter text-white sm:text-3xl md:text-4xl">
                  {details?.title || item.name}
                </h2>
                {yearDisplay && (
                  <div className="pb-1 text-lg text-white/60 sm:text-xl">{yearDisplay}</div>
                )}
              </div>
              {details?.genre_names && details.genre_names.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {details.genre_names.slice(0, 5).map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-px text-xs text-white/70"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 md:p-8">
            {isLoading && (
              <div className="flex h-40 items-center justify-center text-sm text-white/60">
                Loading details and streaming availability…
              </div>
            )}

            {error && !isLoading && (
              <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
                {error}
                <div className="mt-1 text-xs text-red-400/70">
                  Try closing and reopening the card.
                </div>
              </div>
            )}

            {!isLoading && !error && details && (
              <div className="grid gap-6 sm:gap-8 md:grid-cols-5">
                {/* Left column — plot + meta */}
                <div className="md:col-span-3">
                  {details.plot_overview && (
                    <div>
                      <div className="mb-2 text-xs uppercase tracking-widest text-white/50">
                        Overview
                      </div>
                      <p className="text-[15px] leading-relaxed text-white/90">
                        {details.plot_overview}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                    {runtime && (
                      <div className="flex items-center gap-1.5 text-white/70">
                        <Clock className="h-4 w-4" /> {runtime}
                      </div>
                    )}
                    {details.user_rating && (
                      <div className="flex items-center gap-1.5 text-white/70">
                        <Star className="h-4 w-4 text-amber-400" />{" "}
                        {details.user_rating.toFixed(1)} / 10
                      </div>
                    )}
                    {details.critic_score && (
                      <div className="flex items-center gap-1.5 text-white/70">
                        <Star className="h-4 w-4 text-emerald-400" /> Critics{" "}
                        {details.critic_score}
                      </div>
                    )}
                    {details.us_rating && (
                      <div className="rounded bg-white/5 px-2 py-px text-xs text-white/60">
                        {details.us_rating}
                      </div>
                    )}
                  </div>

                  {details.trailer && (
                    <a
                      href={details.trailer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      Watch trailer <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Right column — availability */}
                <div className="md:col-span-2">
                  <div className="mb-3 text-xs uppercase tracking-widest text-white/50">
                    Where to watch in the US
                  </div>

                  {!hasAnySources && (
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 text-sm text-white/70">
                      No current US streaming sources found for this title.
                      Availability changes often — check back soon.
                    </div>
                  )}

                  {hasAnySources && grouped && (
                    <div className="space-y-5">
                      {grouped.subscription.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs font-medium text-emerald-400">
                            STREAM WITH SUBSCRIPTION
                          </div>
                          <div className="space-y-2">
                            {grouped.subscription.map((s) => (
                              <SourcePill
                                key={s.source_id}
                                source={s}
                                logoUrl={providers.get(s.source_id)?.logo_100px}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {grouped.free.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs font-medium text-sky-400">
                            FREE / WITH ADS
                          </div>
                          <div className="space-y-2">
                            {grouped.free.map((s) => (
                              <SourcePill
                                key={s.source_id}
                                source={s}
                                logoUrl={providers.get(s.source_id)?.logo_100px}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {(grouped.rent.length > 0 || grouped.buy.length > 0) && (
                        <div>
                          <div className="mb-2 text-xs font-medium text-amber-400">
                            RENT OR BUY
                          </div>
                          <div className="space-y-2">
                            {[...grouped.rent, ...grouped.buy].map((s) => (
                              <SourcePill
                                key={s.source_id}
                                source={s}
                                logoUrl={providers.get(s.source_id)?.logo_100px}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !error && !details && (
              <div className="text-sm text-white/60">
                Details unavailable right now.
              </div>
            )}
          </div>

          {/* Footer - stays sticky at bottom */}
          <div className="flex-shrink-0 border-t border-white/10 bg-zinc-900/40 px-6 py-3 text-center text-[10px] text-white/40">
            Data provided by Watchmode • Links go to official sources • US availability shown
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
