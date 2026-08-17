export function PageSkeleton({ message = "Opening…" }: { message?: string }) {
  return (
    <div className="px-5 py-8">
      <p className="text-sm text-ink-soft">{message}</p>
      <div className="mt-6 h-10 w-2/3 max-w-md animate-pulse rounded-full bg-cream-deep" />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[28px] bg-paper ring-1 ring-line" />
        <div className="h-64 animate-pulse rounded-[28px] bg-paper ring-1 ring-line" />
      </div>
    </div>
  );
}
