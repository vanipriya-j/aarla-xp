"use client";

import { Spinner } from "@/components/ui/spinner";
import { REJECTION_REASONS } from "@/domains/types";
import { useState } from "react";

export function ResultActions({
  planId,
  personId,
}: {
  planId: string;
  personId: string;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [pending, setPending] = useState<"SAVED" | "REJECTED" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function interact(type: "SAVED" | "REJECTED", reason?: string) {
    if (pending) return;
    setError(null);
    setPending(type);
    if (type === "SAVED") setSaved(true);
    try {
      const response = await fetch("/api/agent/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, type, targetType: "PLAN", targetId: planId, reason }),
      });
      if (!response.ok) throw new Error("Could not save that just now.");
      if (type === "REJECTED") {
        setRejected(true);
        setOpen(false);
      }
    } catch {
      if (type === "SAVED") setSaved(false);
      setError("That didn’t go through. Try once more.");
    } finally {
      setPending(null);
    }
  }

  if (rejected) {
    return <p className="text-sm text-mist">Noted. That signal stays specific — it will not quietly rewrite your taste.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={Boolean(pending) || saved}
        onClick={() => void interact("SAVED")}
        className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-sm text-ink-soft ring-1 ring-line disabled:opacity-70"
      >
        {pending === "SAVED" ? <Spinner className="h-3.5 w-3.5" /> : null}
        {pending === "SAVED" ? "Saving…" : saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        disabled={Boolean(pending)}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-cream px-3 py-1.5 text-sm text-ink-soft ring-1 ring-line disabled:opacity-70"
      >
        Not for me
      </button>
      {open ? (
        <div className="mt-2 flex w-full flex-wrap gap-2">
          {REJECTION_REASONS.map((reason) => (
            <button
              key={reason.id}
              type="button"
              disabled={Boolean(pending)}
              onClick={() => void interact("REJECTED", reason.id)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-ink-soft ring-1 ring-line disabled:opacity-70"
            >
              {pending === "REJECTED" ? <Spinner className="h-3 w-3" /> : null}
              {reason.label}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="w-full text-xs text-karma-create">{error}</p> : null}
    </div>
  );
}
