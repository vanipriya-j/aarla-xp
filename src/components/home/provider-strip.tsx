import { PROVIDERS } from "@/services/providers";

const LABELS: Record<string, string> = {
  uber: "Get a ride",
  ola: "Book a ride",
  rapido: "Get a bike",
  "call-driver": "Call driver",
  valet: "Valet",
  bookmyshow: "Find tickets",
  mdnd: "Local tickets",
  dineout: "Reserve",
  swiggy: "Order food",
  zomato: "Find a table",
  maps: "View map",
  calendar: "Add to calendar",
};

export function ProviderStrip() {
  return (
    <section className="border-t border-line bg-paper/80 px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.18em] text-mist">Things we can do for you</p>
        <p className="mt-1 text-sm text-ink-soft">Placeholder capabilities. Nothing here is a live booking.</p>
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.slug}
              className="min-w-[120px] rounded-2xl bg-cream px-4 py-3 ring-1 ring-line"
            >
              <p className="text-sm font-medium">{provider.name}</p>
              <p className="mt-1 text-xs text-mist">{LABELS[provider.slug] ?? provider.category}</p>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-mist">{provider.status}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
