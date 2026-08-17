import { getBookings } from "@/application/contracts";
import { ExperienceImage } from "@/components/ui/experience-image";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  await ensureSeeded();
  const bookings = await getBookings();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-serif text-4xl">Bookings & tickets</h1>
      <p className="mt-3 text-ink-soft">A single place for tickets, tables and rides linked to your plans. All current items are mock records.</p>
      <div className="mt-8 space-y-4">
        {bookings.map((booking) => (
          <article key={booking.id} className="flex gap-4 rounded-[24px] bg-paper p-4 ring-1 ring-line">
            <ExperienceImage src={booking.imageUrl} alt={booking.title} className="h-20 w-20 rounded-2xl" />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.14em] text-mist">{booking.kind}</p>
              <h2 className="mt-1 text-lg font-medium">{booking.title}</h2>
              <p className="text-sm text-mist">{booking.venue}</p>
              <p className="mt-2 text-xs text-mist">
                {booking.providerSlug} · {booking.status}
                {booking.isMock ? " · placeholder" : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
