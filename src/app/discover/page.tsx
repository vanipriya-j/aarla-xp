import { getForYou } from "@/application/contracts";
import { HeroPrompt } from "@/components/home/hero-prompt";
import { LovedCard } from "@/components/home/plan-card";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  await ensureSeeded();
  const data = await getForYou();

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="font-serif text-4xl">Tell me what you&apos;re looking for</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        This is not a directory. Ask in your own words and Aarla will compose a few plans from what is actually available.
      </p>
      <div className="mt-6">
        <HeroPrompt variant="desktop" />
      </div>
      <h2 className="mt-12 font-serif text-2xl">Because you loved</h2>
      <div className="mt-5 flex gap-4 overflow-x-auto no-scrollbar">
        {data.loved.map((item) => (
          <LovedCard key={item.id} title={item.title} imageUrl={item.imageUrl} notes={item.notes} />
        ))}
      </div>
    </div>
  );
}
