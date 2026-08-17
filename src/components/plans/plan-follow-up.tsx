"use client";

import { startNavigation } from "@/components/layout/navigation-progress";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PlanFollowUp({
  planId,
  personId,
  title,
}: {
  planId: string;
  personId: string;
  title: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [continuing, setContinuing] = useState(false);

  async function share() {
    if (sharing) return;
    setSharing(true);
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } finally {
      setSharing(false);
    }
  }

  function continuePlan() {
    if (continuing) return;
    setContinuing(true);
    void fetch("/api/agent/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, type: "SAVED", targetType: "PLAN", targetId: planId }),
    });
    startNavigation();
    router.push("/bookings");
  }

  return (
    <>
      <button
        type="button"
        onClick={continuePlan}
        disabled={continuing}
        className="inline-flex items-center gap-2 rounded-full bg-purple px-5 py-2 text-sm text-white disabled:opacity-70"
      >
        {continuing ? <Spinner className="h-3.5 w-3.5" /> : null}
        {continuing ? "Continuing…" : "Continue"}
      </button>
      <button
        type="button"
        onClick={() => void share()}
        disabled={sharing}
        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm ring-1 ring-line disabled:opacity-60"
      >
        {sharing ? <Spinner className="h-3.5 w-3.5" /> : null}
        {copied ? "Link copied" : "Share plan"}
      </button>
    </>
  );
}
