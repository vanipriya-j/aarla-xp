"use client";

import { startNavigation } from "@/components/layout/navigation-progress";
import { Icons } from "@/components/layout/icons";
import { Spinner } from "@/components/ui/spinner";
import { AGENT_STATES, QUICK_CUES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function HeroPrompt({
  variant = "desktop",
  initialValue = "",
}: {
  variant?: "desktop" | "mobile";
  initialValue?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [stateLabel, setStateLabel] = useState<string | null>(null);
  const [micNote, setMicNote] = useState<string | null>(null);
  const dark = variant === "mobile";

  const cues = useMemo(
    () => (variant === "mobile" ? QUICK_CUES.filter((cue) => ["hours", "friends", "low", "surprise"].includes(cue.id)) : QUICK_CUES),
    [variant],
  );

  useEffect(() => {
    if (!busy) return;
    let index = 0;
    setStateLabel(AGENT_STATES[0]);
    const timer = window.setInterval(() => {
      index = (index + 1) % AGENT_STATES.length;
      setStateLabel(AGENT_STATES[index]);
    }, 900);
    return () => window.clearInterval(timer);
  }, [busy]);

  function submit(next = value) {
    const text = next.trim();
    if (!text || busy) return;
    setBusy(true);
    setMicNote(null);
    sessionStorage.setItem("aarla:last-prompt", text);
    startNavigation();
    router.push(`/ask?q=${encodeURIComponent(text)}`);
  }

  return (
    <div className="w-full" aria-busy={busy}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-4 py-2 shadow-[0_12px_40px_rgba(26,24,20,0.12)]",
          dark ? "bg-white/10 ring-1 ring-white/10 backdrop-blur" : "bg-white ring-1 ring-line",
          busy && "ring-2 ring-purple/40",
        )}
      >
        <Icons.spark className={cn("h-5 w-5 shrink-0", dark ? "text-[#c4b0e8]" : "text-purple")} />
        <input
          value={value}
          disabled={busy}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder={dark ? "Tell me what you're up for..." : "Tell me naturally. I'll plan the rest."}
          className={cn(
            "h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-mist disabled:opacity-70",
            dark ? "text-white placeholder:text-white/45" : "text-ink",
          )}
        />
        <button
          type="button"
          onClick={() => setMicNote("Voice is coming soon — type or tap a cue for now.")}
          className={cn("rounded-full p-2", dark ? "text-white/70" : "text-mist")}
          aria-label="Speak"
        >
          <Icons.mic className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => submit()}
          disabled={busy || !value.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-purple text-white transition hover:bg-purple-deep disabled:opacity-80"
          aria-label="Ask Aarla"
        >
          {busy ? <Spinner className="h-5 w-5" /> : <Icons.arrow className="h-5 w-5" />}
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {cues.map((cue) => (
          <button
            key={cue.id}
            type="button"
            disabled={busy}
            onClick={() => {
              setValue(cue.prompt);
              submit(cue.prompt);
            }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition disabled:opacity-50",
              dark ? "bg-white/8 text-white/80 ring-1 ring-white/10" : "bg-white/70 text-ink-soft ring-1 ring-line hover:bg-white",
            )}
          >
            {cue.label}
          </button>
        ))}
      </div>
      {stateLabel ? (
        <p className={cn("mt-5 text-sm", dark ? "text-white/70" : "text-ink-soft")} aria-live="polite">
          {stateLabel}
        </p>
      ) : micNote ? (
        <p className={cn("mt-5 text-sm", dark ? "text-white/70" : "text-ink-soft")}>{micNote}</p>
      ) : null}
    </div>
  );
}
