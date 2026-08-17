import { ExperienceImage } from "@/components/ui/experience-image";
import { PendingLink } from "@/components/ui/pending-link";
import type { Plan } from "@/domains/types";
import { formatDuration, formatSpend, priceBandLabel } from "@/lib/cn";

export function PlanCard({
  plan,
  label,
  reason,
  href,
}: {
  plan: Plan;
  label?: string;
  reason?: string;
  href?: string;
}) {
  const destination = href ?? `/plans/${plan.id}`;
  return (
    <article className="group overflow-hidden rounded-[28px] bg-paper shadow-[0_10px_40px_rgba(26,24,20,0.06)] ring-1 ring-line">
      <div className="relative">
        <ExperienceImage src={plan.imageUrl} alt={plan.title} className="aspect-[5/3]" />
        {label ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink">
            {label}
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-lg font-medium leading-snug">{plan.title}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist">
          <span>{formatDuration(plan.durationMinutes)}</span>
          <span>{plan.effort ?? "Easy"}</span>
          <span>{priceBandLabel(undefined, plan.estimatedSpendMin, plan.estimatedSpendMax)}</span>
          <span>{plan.stopCount} places</span>
        </div>
        <p className="text-sm leading-6 text-ink-soft">{reason ?? plan.explanation}</p>
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-mist">{formatSpend(plan.estimatedSpendMin, plan.estimatedSpendMax)}</p>
          <PendingLink
            href={destination}
            pendingLabel="Opening…"
            className="rounded-full bg-purple px-4 py-2 text-sm text-white transition hover:bg-purple-deep"
          >
            See plan
          </PendingLink>
        </div>
      </div>
    </article>
  );
}

export function LovedCard({
  title,
  imageUrl,
  notes,
}: {
  title: string;
  imageUrl?: string | null;
  notes?: string | null;
}) {
  return (
    <article className="min-w-[220px] overflow-hidden rounded-[24px] bg-paper ring-1 ring-line">
      <ExperienceImage src={imageUrl} alt={title} className="aspect-square" />
      <div className="p-4">
        <h3 className="font-medium leading-snug">{title}</h3>
        {notes ? <p className="mt-1 line-clamp-2 text-sm text-mist">{notes}</p> : null}
      </div>
    </article>
  );
}
