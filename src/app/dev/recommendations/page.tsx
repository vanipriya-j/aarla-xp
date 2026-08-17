import { getDevSnapshot, submitLeisurePrompt } from "@/application/contracts";
import { AppShell } from "@/components/layout/app-shell";
import { ensureSeeded } from "@/db/ensure";

export const dynamic = "force-dynamic";

export default async function DevRecommendationsPage() {
  await ensureSeeded();
  const [snapshot, result] = await Promise.all([
    getDevSnapshot(),
    submitLeisurePrompt({
      text: "I have 3 hours with friends from the US. Something very Chennai. Not too touristy. Budget around ₹3k.",
    }),
  ]);

  return (
    <AppShell personName="Dev" locationLabel="Aarla XP">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-serif text-4xl">Recommendation internals</h1>
        <p className="mt-3 text-sm text-mist">{snapshot.engine}</p>
        <pre className="mt-6 overflow-auto rounded-[24px] bg-ink p-5 text-xs leading-6 text-cream">
          {JSON.stringify(
            {
              intent: result.intent,
              circle: result.circle,
              recommendations: result.recommendations.map((rec) => ({
                label: rec.label,
                title: rec.plan.title,
                score: rec.score,
                signals: rec.signals,
                duration: rec.plan.durationMinutes,
                spend: rec.plan.estimatedSpendMax,
              })),
            },
            null,
            2,
          )}
        </pre>
      </div>
    </AppShell>
  );
}
