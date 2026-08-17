import { getForYou } from "@/application/contracts";
import { HeroPrompt } from "@/components/home/hero-prompt";
import { LovedCard, PlanCard } from "@/components/home/plan-card";
import { ProviderStrip } from "@/components/home/provider-strip";
import { KarmaChart } from "@/components/karma/karma-chart";
import { AppShell } from "@/components/layout/app-shell";
import { Icons } from "@/components/layout/icons";
import { ExperienceImage } from "@/components/ui/experience-image";
import { ensureSeeded } from "@/db/ensure";
import { IMG } from "@/lib/images";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeeded();
  const data = await getForYou();

  return (
    <AppShell personName={data.person.name} locationLabel={data.person.locationLabel} avatarUrl={data.person.avatarUrl} theme="dark">
      <div className="xl:hidden">
        <MobileHome data={data} />
      </div>
      <div className="hidden xl:block">
        <DesktopHome data={data} />
      </div>
    </AppShell>
  );
}

function MobileHome({ data }: { data: Awaited<ReturnType<typeof getForYou>> }) {
  return (
    <div className="bg-dark px-5 pb-8 pt-8 text-white">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">Aarla XP</p>
      <h1 className="mt-6 max-w-sm font-serif text-4xl leading-tight">What kind of time do you have today?</h1>
      <div className="mt-6">
        <HeroPrompt variant="mobile" />
      </div>

      <section className="mt-10">
        <h2 className="text-sm uppercase tracking-[0.16em] text-white/45">Your Circles</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto no-scrollbar">
          {data.circles.map((circle) => (
            <Link key={circle.id} href={`/circles`} className="flex w-16 flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-sm ring-1 ring-white/10">
                {circle.name.slice(0, 1)}
              </div>
              <span className="text-center text-[11px] text-white/70">{circle.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[28px] bg-dark-card p-5 ring-1 ring-white/5">
        <KarmaChart
          karma={data.karma}
          size={168}
          insight="Looks like your Culture and Social moments are shining. Maybe something active or creative next?"
        />
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Because you loved</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto no-scrollbar">
          {data.loved.map((item) => (
            <div key={item.id} className="min-w-[200px] overflow-hidden rounded-[24px] bg-dark-card">
              <ExperienceImage src={item.imageUrl} alt={item.title} className="aspect-[4/3]" />
              <div className="p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-white/50">{item.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DesktopHome({ data }: { data: Awaited<ReturnType<typeof getForYou>> }) {
  return (
    <div className="bg-cream text-ink">
      <header className="flex items-center justify-end gap-4 px-8 py-5">
        <span className="rounded-full bg-white px-3 py-1 text-sm text-ink-soft ring-1 ring-line">31°C</span>
        <span className="rounded-full bg-white px-3 py-1 text-sm text-ink-soft ring-1 ring-line">{data.person.city}</span>
        <span className="relative rounded-full bg-white p-2 ring-1 ring-line">
          <Icons.bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple text-[10px] text-white">3</span>
        </span>
        <Link href="/ask" className="rounded-full bg-purple px-4 py-2 text-sm text-white">
          + New plan
        </Link>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-8 px-8 pb-10">
        <div>
          <section className="relative overflow-hidden rounded-[32px]">
            <ExperienceImage src={IMG.temple} alt="Chennai evening" className="h-[360px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h1 className="max-w-xl font-serif text-5xl leading-tight">What kind of time do you have today?</h1>
              <p className="mt-3 text-white/75">Tell me naturally. I&apos;ll plan the rest.</p>
              <div className="mt-6 max-w-3xl">
                <HeroPrompt
                  variant="desktop"
                  initialValue="I have 3 hours with friends from the US. Something very Chennai. Not too touristy. Budget around ₹3k."
                />
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-3xl">Handpicked for you</h2>
              <Link href="/discover" className="text-sm text-mist">
                View all experiences
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-5">
              {data.handpicked.map((plan) => (
                <PlanCard key={plan.id} plan={plan} label={labelFor(plan.personality)} />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-serif text-3xl">Because you loved</h2>
            <div className="mt-5 flex gap-4 overflow-x-auto no-scrollbar">
              {data.loved.map((item) => (
                <LovedCard key={item.id} title={item.title} imageUrl={item.imageUrl} notes={item.notes} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[28px] bg-paper p-5 ring-1 ring-line">
            <h2 className="font-serif text-2xl">Your XP Karma</h2>
            <p className="mt-1 text-sm text-mist">Balanced karma</p>
            <div className="mt-4">
              <KarmaChart karma={data.karma} size={156} compact insight={data.insight} />
            </div>
            <Link href="/karma" className="mt-4 inline-flex rounded-full bg-cream px-4 py-2 text-sm ring-1 ring-line">
              See insights
            </Link>
          </section>

          <section className="rounded-[28px] bg-paper p-5 ring-1 ring-line">
            <h2 className="font-serif text-2xl">What&apos;s coming up</h2>
            <div className="mt-4 space-y-3">
              {data.bookings.map((booking) => (
                <div key={booking.id} className="flex gap-3">
                  <ExperienceImage src={booking.imageUrl} alt={booking.title} className="h-14 w-14 rounded-2xl" />
                  <div>
                    <p className="text-sm font-medium">{booking.title}</p>
                    <p className="text-xs text-mist">{booking.venue}</p>
                    <Link href="/bookings" className="text-xs text-purple">
                      View ticket
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] bg-paper ring-1 ring-line">
            <ExperienceImage src={IMG.park} alt="" className="h-32" />
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-mist">XP Nudge</p>
              <h3 className="mt-2 font-serif text-2xl">{data.nudge.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{data.nudge.body}</p>
              <Link href="/ask?q=Surprise%20me%20this%20weekend." className="mt-4 inline-flex rounded-full bg-purple px-4 py-2 text-sm text-white">
                Show me ideas
              </Link>
            </div>
          </section>
        </aside>
      </div>
      <ProviderStrip />
    </div>
  );
}

function labelFor(personality?: string | null) {
  if (personality === "BEST_FIT") return "Best for you";
  if (personality === "CONTEMPORARY") return "Contemporary Chennai";
  if (personality === "SLOW") return "Slow & relax";
  if (personality === "LOCAL") return "Local & lived-in";
  return "Handpicked";
}
