"use client";

import { Icons } from "@/components/layout/icons";
import { QUICK_CUES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  const dark = variant === "mobile";

  const cues = useMemo(
    () => (variant === "mobile" ? QUICK_CUES.filter((cue) => ["hours", "friends", "low", "surprise"].includes(cue.id)) : QUICK_CUES),
    [variant],
  );

  async function submit(next = value) {
    const text = next.trim();
    if (!text || busy) return;
    setBusy(true);
    sessionStorage.setItem("aarla:last-prompt", text);
    const states = [
      "Understanding your plan...",
      "Looking at what fits...",
      "Checking whether it works in the time you have...",
      "Putting together a few possibilities...",
    ];
    for (const label of states) {
      setStateLabel(label);
      await wait(reduced() ? 40 : 420);
    }
    router.push(`/ask?q=${encodeURIComponent(text)}`);
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-4 py-2 shadow-[0_12px_40px_rgba(26,24,20,0.12)]",
          dark ? "bg-white/10 ring-1 ring-white/10 backdrop-blur" : "bg-white ring-1 ring-line",
        )}
      >
        <Icons.spark className={cn("h-5 w-5 shrink-0", dark ? "text-[#c4b0e8]" : "text-purple")} />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          placeholder={dark ? "Tell me what you're up for..." : "Tell me naturally. I'll plan the rest."}
          className={cn(
            "h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-mist",
            dark ? "text-white placeholder:text-white/45" : "text-ink",
          )}
        />
        <button type="button" className={cn("rounded-full p-2", dark ? "text-white/70" : "text-mist")} aria-label="Speak">
          <Icons.mic className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-purple text-white transition hover:bg-purple-deep"
          aria-label="Ask Aarla"
        >
          <Icons.arrow className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {cues.map((cue) => (
          <button
            key={cue.id}
            type="button"
            onClick={() => {
              setValue(cue.prompt);
              void submit(cue.prompt);
            }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition",
              dark ? "bg-white/8 text-white/80 ring-1 ring-white/10" : "bg-white/70 text-ink-soft ring-1 ring-line hover:bg-white",
            )}
          >
            {cue.label}
          </button>
        ))}
      </div>
      {stateLabel ? (
        <p className={cn("mt-5 text-sm", dark ? "text-white/70" : "text-ink-soft")}>{stateLabel}</p>
      ) : null}
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function reduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
