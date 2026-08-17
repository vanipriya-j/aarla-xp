import { getProfile } from "@/application/contracts";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await ensureSeeded();
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-serif text-4xl">{profile.person.name}</h1>
      <p className="mt-2 text-ink-soft">{profile.person.locationLabel}</p>
      <p className="mt-6 max-w-xl leading-7 text-ink-soft">
        Aarla remembers what you say and what you do. Explicit truths are never silently overwritten.
      </p>
      <div className="mt-8 space-y-4">
        {profile.memories.map((memory) => (
          <article key={memory.id} className="rounded-[24px] bg-paper p-5 ring-1 ring-line">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">
              {memory.layer} · {memory.category}
            </p>
            <p className="mt-2 leading-7">{memory.statement}</p>
            <p className="mt-2 text-xs text-mist">Confidence {Math.round(memory.confidence * 100)}%</p>
          </article>
        ))}
      </div>
    </div>
  );
}
