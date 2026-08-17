import { getDevSnapshot } from "@/application/contracts";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function DevProvidersPage() {
  await ensureSeeded();
  const snapshot = await getDevSnapshot();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-serif text-4xl">Provider capabilities</h1>
      <p className="mt-3 text-ink-soft">No action is shown as live unless the capability status is LIVE_API or PARTNER_API.</p>
      <div className="mt-8 space-y-4">
        {snapshot.providers.map((provider) => (
          <article key={provider.slug} className="rounded-[24px] bg-paper p-5 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{provider.name}</h2>
              <span className="text-xs uppercase tracking-wider text-mist">{provider.status}</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-ink-soft">
              {provider.capabilities.map((cap) => (
                <li key={cap.capability}>
                  {cap.capability} · {cap.status}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
