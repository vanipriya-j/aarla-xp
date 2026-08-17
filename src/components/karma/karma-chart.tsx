import { KARMA_DIMENSIONS, type KarmaDimension, type XPKarma } from "@/domains/types";
import { cn } from "@/lib/cn";

const COLORS: Record<KarmaDimension, string> = {
  move: "var(--karma-move)",
  create: "var(--karma-create)",
  explore: "var(--karma-explore)",
  culture: "var(--karma-culture)",
  social: "var(--karma-social)",
  rest: "var(--karma-rest)",
  learn: "var(--karma-learn)",
  play: "var(--karma-play)",
};

export function KarmaChart({
  karma,
  size = 180,
  insight,
  compact = false,
}: {
  karma: XPKarma;
  size?: number;
  insight?: string;
  compact?: boolean;
}) {
  const stops = KARMA_DIMENSIONS.map((dimension, index) => {
    const start = KARMA_DIMENSIONS.slice(0, index).reduce((sum, key) => sum + karma.percents[key], 0);
    const end = start + karma.percents[dimension];
    return `${COLORS[dimension]} ${start}% ${end}%`;
  }).join(", ");

  return (
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
      <div className="flex items-center justify-center">
        <div
          className="relative rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
          style={{
            width: size,
            height: size,
            background: `conic-gradient(${stops})`,
          }}
        >
          <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-paper text-center shadow-sm">
            <p className="font-serif text-lg text-ink">XP Karma</p>
            <p className="mt-1 max-w-[8rem] text-[11px] leading-4 text-mist">Balance, not a score</p>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {KARMA_DIMENSIONS.map((dimension) => (
            <div key={dimension} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 capitalize text-ink-soft">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[dimension] }} />
                {dimension}
              </span>
              <span className="tabular-nums text-mist">{karma.percents[dimension]}%</span>
            </div>
          ))}
        </div>
      )}
      {insight ? <p className="text-sm leading-6 text-ink-soft">{insight}</p> : null}
    </div>
  );
}

export function KarmaBars({ karma }: { karma: XPKarma }) {
  return (
    <div className="space-y-3">
      {KARMA_DIMENSIONS.map((dimension) => (
        <div key={dimension}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="capitalize">{dimension}</span>
            <span className="text-mist">{karma.percents[dimension]}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cream-deep">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${karma.percents[dimension]}%`, background: COLORS[dimension] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
