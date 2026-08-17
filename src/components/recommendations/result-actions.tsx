"use client";

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

  async function interact(type: string, reason?: string) {
    await fetch("/api/agent/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, type, targetType: "PLAN", targetId: planId, reason }),
    });
    if (type === "SAVED") setSaved(true);
    if (type === "REJECTED") {
      setRejected(true);
      setOpen(false);
    }
  }

  if (rejected) {
    return <p className="text-sm text-mist">Noted. That signal stays specific — it will not quietly rewrite your taste.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void interact("SAVED")}
        className="rounded-full bg-cream px-3 py-1.5 text-sm text-ink-soft ring-1 ring-line"
      >
        {saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-cream px-3 py-1.5 text-sm text-ink-soft ring-1 ring-line"
      >
        Not for me
      </button>
      {open ? (
        <div className="mt-2 flex w-full flex-wrap gap-2">
          {REJECTION_REASONS.map((reason) => (
            <button
              key={reason.id}
              type="button"
              onClick={() => void interact("REJECTED", reason.id)}
              className="rounded-full bg-white px-3 py-1 text-xs text-ink-soft ring-1 ring-line"
            >
              {reason.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
