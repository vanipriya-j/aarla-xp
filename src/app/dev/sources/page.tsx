import { getDevSnapshot } from "@/application/contracts";
import { AppShell } from "@/components/layout/app-shell";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function DevSourcesPage() {
  await ensureSeeded();
  const snapshot = await getDevSnapshot();

  return (
    <AppShell personName="Dev" locationLabel="Aarla XP">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-serif text-4xl">Source connectors</h1>
        <p className="mt-3 text-ink-soft">Framework only. No live scraping.</p>
        <div className="mt-8 space-y-4">
          {snapshot.connectors.map((connector) => (
            <article key={connector.sourceId} className="rounded-[24px] bg-paper p-5 ring-1 ring-line">
              <h2 className="text-lg font-medium">{connector.sourceId}</h2>
              <p className="mt-2 text-sm text-mist">{connector.health.status}</p>
              <p className="mt-1 text-sm text-ink-soft">{connector.health.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
