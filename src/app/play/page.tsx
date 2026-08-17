import { getForYou } from "@/application/contracts";
import { AppShell } from "@/components/layout/app-shell";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function PlayPage() {
  await ensureSeeded();
  const data = await getForYou();

  return (
    <AppShell personName={data.person.name} locationLabel={data.person.locationLabel} avatarUrl={data.person.avatarUrl}>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-serif text-4xl">Aarla Play</h1>
        <p className="mt-3 text-lg text-ink-soft">Waiting-time management.</p>
        <div className="mt-8 rounded-[28px] bg-paper p-6 ring-1 ring-line">
          <p className="leading-7 text-ink-soft">
            Play is a related product for the ten minutes between things — a school pickup, a delayed table, a train that is almost here.
            The route exists so the navigation is honest. The full experience is not in this build.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
