import { getPlan } from "@/application/contracts";
import { PlanTimeline } from "@/components/plans/timeline";
import { PlanFollowUp } from "@/components/plans/plan-follow-up";
import { ResultActions } from "@/components/recommendations/result-actions";
import { ExperienceImage } from "@/components/ui/experience-image";
import { ensureSeeded } from "@/db/ensure";
import { formatDuration, formatSpend } from "@/lib/cn";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureSeeded();
  const { id } = await params;
  const detail = await getPlan(id);
  if (!detail) notFound();

  const { plan, circle, steps } = detail;

  return (
    <article className="mx-auto max-w-3xl pb-16">
        <ExperienceImage src={plan.imageUrl} alt={plan.title} className="h-64 w-full xl:h-80" />
        <div className="px-5 pt-6">
          <p className="text-xs uppercase tracking-[0.16em] text-mist">{circle?.name ?? "Plan"}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight">{plan.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-mist">
            <span>{formatDuration(plan.durationMinutes)}</span>
            <span>{plan.effort ?? "Easy"}</span>
            <span>{plan.stopCount} places</span>
            <span>{formatSpend(plan.estimatedSpendMin, plan.estimatedSpendMax)}</span>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft">{plan.explanation}</p>

          <div className="mt-10">
            <h2 className="font-serif text-2xl">The evening</h2>
            <div className="mt-6">
              <PlanTimeline
                steps={steps.map((step) => ({
                  sortOrder: step.sortOrder,
                  kind: step.kind,
                  title: step.title,
                  description: step.description ?? undefined,
                  startsAt: step.startsAt ?? undefined,
                  durationMin: step.durationMin,
                  actionKind: step.actionKind ?? undefined,
                  placeName: step.place?.name,
                }))}
              />
            </div>
          </div>

          <section className="mt-10 rounded-[28px] bg-paper p-5 ring-1 ring-line">
            <p className="text-sm text-mist">Estimated spend{circle?.memberSummary ? ` for ${circle.memberSummary}` : ""}</p>
            <p className="mt-2 font-serif text-3xl">{formatSpend(plan.estimatedSpendMin, plan.estimatedSpendMax)}</p>
            <p className="mt-2 text-sm text-ink-soft">Travel is easy. Nothing here is a live booking.</p>
          </section>

          <div className="mt-6 flex flex-wrap gap-3">
            <ResultActions planId={plan.id} personId={plan.personId} />
            <PlanFollowUp planId={plan.id} personId={plan.personId} title={plan.title} />
          </div>
        </div>
      </article>
    );
}
