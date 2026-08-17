"use client";

import type { AgentResult } from "@/application/leisure-agent/types";
import { HeroPrompt } from "@/components/home/hero-prompt";
import { AskLoading } from "@/components/recommendations/ask-loading";
import { ResultActions } from "@/components/recommendations/result-actions";
import { ExperienceImage } from "@/components/ui/experience-image";
import { PendingLink } from "@/components/ui/pending-link";
import { formatDuration, priceBandLabel } from "@/lib/cn";
import { DEMO_PERSON_ID } from "@/lib/constants";
import { useEffect, useState } from "react";

export function AskExperience({ query }: { query: string }) {
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError(null);
    sessionStorage.setItem("aarla:last-prompt", query);

    fetch("/api/agent/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Ask failed");
        return (await response.json()) as AgentResult;
      })
      .then((data) => setResult(data))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError("I couldn’t put plans together just now. Try that again.");
      });

    return () => controller.abort();
  }, [query]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 xl:max-w-5xl xl:px-10">
        <p className="font-serif text-3xl">Something stalled</p>
        <p className="mt-4 text-ink-soft">{error}</p>
        <div className="mt-6">
          <HeroPrompt variant="desktop" initialValue={query} />
        </div>
      </div>
    );
  }

  if (!result) {
    return <AskLoading query={query} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 xl:max-w-5xl xl:px-10">
      <p className="text-xs uppercase tracking-[0.18em] text-mist">Current request</p>
      <p className="mt-3 max-w-2xl font-serif text-3xl leading-snug xl:text-4xl">{result.intent.rawInput}</p>
      <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft">{result.reply}</p>
      {result.circle ? (
        <p className="mt-3 text-sm text-mist">
          Listening as <span className="text-ink">{result.circle.name}</span>
        </p>
      ) : null}

      <div className="mt-6">
        <HeroPrompt variant="desktop" initialValue={query} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {result.recommendations.map((rec) => (
          <span key={rec.label} className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-line">
            {rec.label}
          </span>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {result.recommendations.map((rec) => (
          <article key={rec.plan.id} className="overflow-hidden rounded-[28px] bg-paper ring-1 ring-line xl:grid xl:grid-cols-[1.1fr_1fr]">
            <ExperienceImage src={rec.plan.imageUrl} alt={rec.plan.title} className="aspect-[16/10] xl:aspect-auto xl:min-h-full" />
            <div className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-mist">{rec.label}</p>
              <h2 className="text-2xl font-medium leading-snug">{rec.plan.title}</h2>
              <div className="flex flex-wrap gap-x-4 text-sm text-mist">
                <span>{formatDuration(rec.plan.durationMinutes)}</span>
                <span>{rec.plan.effort ?? "Easy"}</span>
                <span>{priceBandLabel(undefined, rec.plan.estimatedSpendMin, rec.plan.estimatedSpendMax)}</span>
                <span>{rec.plan.stopCount} places</span>
              </div>
              <p className="text-sm leading-7 text-ink-soft">
                <span className="font-medium text-ink">Why this? </span>
                {rec.reason}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ResultActions planId={rec.plan.id} personId={result.intent.personId || DEMO_PERSON_ID} />
                <PendingLink href={`/plans/${rec.plan.id}`} pendingLabel="Opening…" className="rounded-full bg-purple px-4 py-2 text-sm text-white">
                  Open plan
                </PendingLink>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
