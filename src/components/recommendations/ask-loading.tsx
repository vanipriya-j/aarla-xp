"use client";

import { AGENT_STATES } from "@/lib/constants";
import { useEffect, useState } from "react";

export function AskLoading() {
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(sessionStorage.getItem("aarla:last-prompt") ?? "");
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % AGENT_STATES.length);
    }, 900);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] border-r border-line bg-paper px-5 py-6 xl:block">
        <p className="font-serif text-3xl tracking-tight">Aarla XP</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mist">Your leisure time concierge</p>
      </aside>
      <div className="mx-auto max-w-3xl px-5 py-8 xl:max-w-5xl xl:pl-[300px] xl:pr-10">
        <p className="text-xs uppercase tracking-[0.18em] text-mist">Current request</p>
        {query ? (
          <p className="mt-3 max-w-2xl font-serif text-3xl leading-snug xl:text-4xl">{query}</p>
        ) : (
          <div className="mt-3 h-10 w-3/4 max-w-xl animate-pulse rounded-full bg-cream-deep" />
        )}
        <p className="mt-5 text-base text-ink-soft" aria-live="polite">
          {AGENT_STATES[index]}
        </p>
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, card) => (
            <div key={card} className="overflow-hidden rounded-[28px] bg-paper ring-1 ring-line xl:grid xl:grid-cols-[1.1fr_1fr]">
              <div className="aspect-[16/10] animate-pulse bg-cream-deep xl:min-h-[220px]" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-24 animate-pulse rounded-full bg-cream-deep" />
                <div className="h-7 w-3/4 animate-pulse rounded-full bg-cream-deep" />
                <div className="h-4 w-full animate-pulse rounded-full bg-cream-deep" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-cream-deep" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
