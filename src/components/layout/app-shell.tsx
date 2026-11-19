"use client";

import { Icons } from "@/components/layout/icons";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { Spinner } from "@/components/ui/spinner";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ICON_MAP = {
  home: Icons.home,
  search: Icons.search,
  plans: Icons.plans,
  ticket: Icons.ticket,
  karma: Icons.karma,
  play: Icons.play,
  heart: Icons.heart,
  circles: Icons.circles,
  profile: Icons.profile,
};

export function AppShell({
  children,
  personName,
  locationLabel,
  avatarUrl,
}: {
  children: ReactNode;
  personName: string;
  locationLabel: string;
  avatarUrl?: string;
}) {
  const pathname = usePathname();
  const dark = pathname === "/";

  return (
    <div className={cn("min-h-screen", dark ? "bg-dark text-white" : "bg-cream text-ink")}>
      <NavigationProgress />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-line bg-paper px-5 py-6 xl:flex">
        <Link href="/" className="px-2">
          <p className="font-serif text-3xl tracking-tight">Aarla XP</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mist">Your leisure time concierge</p>
        </Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.filter((item) => item.desktop).map((item) => {
            const Icon = ICON_MAP[item.icon];
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-purple-soft text-purple-deep" : "text-ink-soft hover:bg-cream",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                <NavPending className="ml-auto" />
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-soft text-sm text-purple">
                {personName.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{personName}</p>
              <p className="text-xs text-mist">{locationLabel}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-ink px-4 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-white/50">Aarla for you</p>
            <p className="mt-2 text-sm leading-6 text-white/85">Plans shaped by your tastes, mood and patterns — not a profile form.</p>
          </div>
        </div>
      </aside>

      <div className="xl:pl-[260px]">
        <div className="pb-24 xl:pb-0">{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-dark/95 px-2 py-2 backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {NAV_ITEMS.filter((item) => item.mobile).map((item) => {
            const Icon = ICON_MAP[item.icon];
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px]",
                  active ? "text-white" : "text-white/45",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-[#c4b0e8]")} />
                {item.label}
                <NavPending className="absolute right-1 top-1 h-2.5 w-2.5 border-[#c4b0e8]" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NavPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className={cn("h-3.5 w-3.5", className)} />;
}
