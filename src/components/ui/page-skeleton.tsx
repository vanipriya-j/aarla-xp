import { cn } from "@/lib/cn";

export function PageSkeleton({
  tone = "cream",
  message = "Opening…",
}: {
  tone?: "cream" | "dark";
  message?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("min-h-screen", dark ? "bg-dark text-white" : "bg-cream text-ink")}>
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] border-r border-line bg-paper px-5 py-6 xl:block">
        <div className="h-8 w-32 animate-pulse rounded bg-cream-deep" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-2xl bg-cream" />
          ))}
        </div>
      </aside>
      <div className="px-5 py-8 xl:pl-[300px] xl:pr-10">
        <p className={cn("text-sm", dark ? "text-white/60" : "text-ink-soft")}>{message}</p>
        <div className="mt-6 h-10 w-2/3 max-w-md animate-pulse rounded-full bg-current/10" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className={cn("h-64 animate-pulse rounded-[28px]", dark ? "bg-dark-card" : "bg-paper ring-1 ring-line")} />
          <div className={cn("h-64 animate-pulse rounded-[28px]", dark ? "bg-dark-card" : "bg-paper ring-1 ring-line")} />
        </div>
      </div>
    </div>
  );
}
