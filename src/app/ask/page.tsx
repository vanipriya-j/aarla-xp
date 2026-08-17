import { submitLeisurePrompt } from "@/application/contracts";
import { HeroPrompt } from "@/components/home/hero-prompt";
import { AppShell } from "@/components/layout/app-shell";
import { ResultActions } from "@/components/recommendations/result-actions";
import { ExperienceImage } from "@/components/ui/experience-image";
import { ensureSeeded } from "@/db/ensure";
import { formatDuration, priceBandLabel } from "@/lib/cn";
import { DEMO_PERSON_ID } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await ensureSeeded();
  const params = await searchParams;
  const query =
    typeof params.q === "string"
      ? params.q
      : "I have 3 hours with friends from the US. Something very Chennai. Not too touristy. Budget around ₹3k.";

  const result = await submitLeisurePrompt({ text: query });

  return (
    <AppShell personName="Vanipriya" locationLabel="Chennai, India" theme="cream">
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
                  <Link href={`/plans/${rec.plan.id}`} className="rounded-full bg-purple px-4 py-2 text-sm text-white">
                    Open plan
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
