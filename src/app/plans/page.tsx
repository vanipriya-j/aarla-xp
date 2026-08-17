import { getForYou, getPlans } from "@/application/contracts";
import { PlanCard } from "@/components/home/plan-card";
import { AppShell } from "@/components/layout/app-shell";
import { PendingLink } from "@/components/ui/pending-link";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await ensureSeeded();
  const params = await searchParams;
  const tab = params.tab === "saved" ? "SAVED" : params.tab === "done" ? "DONE" : "UPCOMING";
  const [data, plans] = await Promise.all([getForYou(), getPlans(undefined, tab)]);

  return (
    <AppShell personName={data.person.name} locationLabel={data.person.locationLabel} avatarUrl={data.person.avatarUrl}>
      <div className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-serif text-4xl">My plans</h1>
        <div className="mt-6 flex gap-2">
          {[
            ["upcoming", "Upcoming"],
            ["saved", "Saved"],
            ["done", "Done"],
          ].map(([key, label]) => (
            <PendingLink
              key={key}
              href={`/plans?tab=${key}`}
              className={`rounded-full px-4 py-2 text-sm ring-1 ring-line ${tab === key.toUpperCase() ? "bg-ink text-white" : "bg-white"}`}
            >
              {label}
            </PendingLink>
          ))}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} label={plan.status} />
          ))}
          {!plans.length ? <p className="text-mist">Nothing in this list yet.</p> : null}
        </div>
      </div>
    </AppShell>
  );
}
