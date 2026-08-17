import type { PlanStep } from "@/domains/types";
import { actionsForNeed } from "@/services/providers";

export function PlanTimeline({ steps }: { steps: Array<PlanStep & { placeName?: string }> }) {
  return (
    <ol className="relative space-y-6 border-l border-line pl-6">
      {steps.map((step) => {
        const time = step.startsAt
          ? new Date(step.startsAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
          : null;
        const actions = step.actionKind ? actionsForNeed(needFrom(step.actionKind)) : [];
        return (
          <li key={`${step.sortOrder}-${step.title}`} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-purple ring-4 ring-cream" />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-mist">{time ?? step.kind}</p>
              <p className="text-xs text-mist">{step.durationMin} min</p>
            </div>
            <h3 className="mt-1 text-lg font-medium">{step.title}</h3>
            {step.description ? <p className="mt-1 text-sm leading-6 text-ink-soft">{step.description}</p> : null}
            {step.placeName ? <p className="mt-1 text-sm text-mist">{step.placeName}</p> : null}
            {actions.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {actions.slice(0, 2).map((action) => (
                  <span
                    key={`${action.providerSlug}-${action.capability}`}
                    className="rounded-full bg-purple-soft px-3 py-1 text-xs text-purple-deep"
                  >
                    {action.label}
                    {!action.live ? " · placeholder" : ""}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function needFrom(capability: string) {
  if (capability.startsWith("RIDE")) return "ride";
  if (capability.startsWith("DINING")) return "dining";
  if (capability.startsWith("EVENT")) return "tickets";
  if (capability === "MAP_ROUTE") return "map";
  if (capability === "CALENDAR_ADD") return "calendar";
  return capability;
}
