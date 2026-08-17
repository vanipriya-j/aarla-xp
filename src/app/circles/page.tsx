import { getCircles } from "@/application/contracts";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function CirclesPage() {
  await ensureSeeded();
  const circles = await getCircles();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-serif text-4xl">Your Circles</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        These were inferred from how you actually spend time. You can edit them later — you were never asked to fill a form.
      </p>
      <div className="mt-8 space-y-4">
        {circles.map((circle) => (
          <article key={circle.id} className="rounded-[28px] bg-paper p-5 ring-1 ring-line">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">{circle.inferred ? "Inferred" : "Edited"}</p>
            <h2 className="mt-2 font-serif text-3xl">{circle.name}</h2>
            <p className="mt-2 text-sm text-mist">{circle.memberSummary}</p>
            <p className="mt-3 leading-7 text-ink-soft">{circle.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
