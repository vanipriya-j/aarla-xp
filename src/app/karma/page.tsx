import { getForYou, getKarma } from "@/application/contracts";
import { KarmaBars, KarmaChart } from "@/components/karma/karma-chart";
import { AppShell } from "@/components/layout/app-shell";
import { ensureSeeded } from "@/db/ensure";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function KarmaPage() {
  await ensureSeeded();
  const [data, karma] = await Promise.all([getForYou(), getKarma()]);

  return (
    <AppShell personName={data.person.name} locationLabel={data.person.locationLabel} avatarUrl={data.person.avatarUrl}>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-serif text-4xl">Your XP Karma</h1>
        <p className="mt-3 text-lg text-ink-soft">A balanced Karma = a richer leisure life.</p>
        <div className="mt-8 rounded-[28px] bg-paper p-6 ring-1 ring-line">
          <KarmaChart karma={karma} size={220} insight={data.insight} />
        </div>
        <div className="mt-8 rounded-[28px] bg-paper p-6 ring-1 ring-line">
          <h2 className="font-serif text-2xl">This month</h2>
          <div className="mt-5">
            <KarmaBars karma={karma} />
          </div>
        </div>
        <p className="mt-6 text-sm leading-6 text-ink-soft">{data.nudge.body}</p>
        <Link href="/ask?q=Surprise%20me%20this%20weekend." className="mt-6 inline-flex rounded-full bg-purple px-4 py-2 text-sm text-white">
          Show me a different kind of time
        </Link>
      </div>
    </AppShell>
  );
}
