import { getFavorites, getForYou } from "@/application/contracts";
import { AppShell } from "@/components/layout/app-shell";
import { ExperienceImage } from "@/components/ui/experience-image";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  await ensureSeeded();
  const [data, favorites] = await Promise.all([getForYou(), getFavorites()]);

  return (
    <AppShell personName={data.person.name} locationLabel={data.person.locationLabel} avatarUrl={data.person.avatarUrl}>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-serif text-4xl">Favorites</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {favorites.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[24px] bg-paper ring-1 ring-line">
              <ExperienceImage src={item.imageUrl} alt={item.title} className="aspect-[16/10]" />
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-mist">{item.targetType}</p>
                <h2 className="mt-1 text-lg font-medium">{item.title}</h2>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
