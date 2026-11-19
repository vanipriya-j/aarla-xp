"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function startNavigation() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("aarla:navigate"));
  }
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isInternalHref(href: string) {
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function sameDestination(href: string, pathname: string) {
  const url = new URL(href, window.location.href);
  return url.pathname === pathname && url.search === window.location.search;
}

function rememberAskPrompt(href: string) {
  try {
    const url = new URL(href, window.location.href);
    if (url.pathname !== "/ask") return;
    const query = url.searchParams.get("q");
    if (query) sessionStorage.setItem("aarla:last-prompt", query);
  } catch {
    // ignore malformed hrefs
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const arrivedAt = useRef(0);

  useEffect(() => {
    setPending(false);
    arrivedAt.current = Date.now();
  }, [pathname]);

  useEffect(() => {
    function begin() {
      if (Date.now() - arrivedAt.current < 40) return;
      setPending(true);
    }

    function onClick(event: MouseEvent) {
      if (isModifiedClick(event)) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || (anchor.target && anchor.target !== "_self")) return;
      const href = anchor.getAttribute("href");
      if (!href || !isInternalHref(href) || sameDestination(href, pathname)) return;
      rememberAskPrompt(href);
      begin();
    }

    window.addEventListener("aarla:navigate", begin);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("aarla:navigate", begin);
      document.removeEventListener("click", onClick, true);
    };
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const timeout = window.setTimeout(() => setPending(false), 8000);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  if (!pending) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]" aria-live="polite" aria-busy="true">
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-purple-soft">
        <div className="nav-progress-bar h-full w-1/3 bg-purple" />
      </div>
      <div className="absolute inset-x-0 bottom-24 flex justify-center px-4 xl:bottom-auto xl:top-5">
        <p className="rounded-full bg-ink px-4 py-2 text-sm text-white shadow-[0_12px_40px_rgba(26,24,20,0.22)]">
          Working on it…
        </p>
      </div>
    </div>
  );
}
