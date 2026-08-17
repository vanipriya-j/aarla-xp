import type { MemoryProposal, MemoryRecord, Preference } from "@/domains/types";

export interface MemoryDecision {
  proposal: MemoryProposal;
  action: "PERSIST" | "REINFORCE" | "REJECT";
  reason: string;
}

export function validateMemoryProposal(
  proposal: MemoryProposal,
  existing: MemoryRecord[],
  preferences: Preference[],
): MemoryDecision {
  const explicit = [...existing.filter((m) => m.layer === "EXPLICIT" && m.status === "ACTIVE"), ...preferences.filter((p) => p.source === "EXPLICIT")];

  if (proposal.mutation === "CONTRADICT") {
    const contradicted = existing.find((m) =>
      similarStatement(m.statement, proposal.statement) && m.layer === "EXPLICIT" && m.status === "ACTIVE",
    );
    if (contradicted) {
      return {
        proposal,
        action: "REJECT",
        reason: "Explicit truths are never silently overwritten.",
      };
    }
  }

  if (proposal.confidence < 0.45) {
    return { proposal, action: "REJECT", reason: "Confidence is too low to persist." };
  }

  const same = existing.find(
    (m) =>
      m.status === "ACTIVE" &&
      m.category === proposal.category &&
      similarStatement(m.statement, proposal.statement) &&
      (m.circleId ?? m.personId) === proposal.subjectId,
  );

  if (same && proposal.mutation === "CREATE") {
    return { proposal, action: "REINFORCE", reason: "An equivalent memory already exists." };
  }

  if (proposal.mutation === "WEAKEN" && same?.layer === "EXPLICIT") {
    return { proposal, action: "REJECT", reason: "Cannot weaken an explicit statement from inference alone." };
  }

  const explicitConflict = explicit.some((item) => {
    const text = "statement" in item ? item.statement : `${item.key} ${item.value}`;
    return conflicts(text, proposal.statement);
  });
  if (explicitConflict) {
    return { proposal, action: "REJECT", reason: "Conflicts with an explicit truth." };
  }

  if (proposal.mutation === "REINFORCE") {
    return { proposal, action: "REINFORCE", reason: "Evidence supports an existing memory." };
  }

  return { proposal, action: "PERSIST", reason: "Proposal is consistent and evidenced." };
}

export function applyRejectionToMemory(reason: string): { category: string; statement: string } | null {
  if (reason === "too_far") {
    return {
      category: "travel_tolerance",
      statement: "Recent rejection was about distance, not the activity itself.",
    };
  }
  if (reason === "too_expensive") {
    return {
      category: "budget_sensitivity",
      statement: "Recent rejection was about spend, not the activity type.",
    };
  }
  if (reason === "too_much_effort") {
    return {
      category: "effort_tolerance",
      statement: "Recent rejection was about effort, not the subject matter.",
    };
  }
  if (reason === "not_my_vibe") {
    return {
      category: "taste",
      statement: "The atmosphere of a recent suggestion did not feel like a fit.",
    };
  }
  return null;
}

export function shouldTouchAffinity(reason?: string | null) {
  return !reason || !["too_far", "too_expensive", "too_crowded", "wrong_time", "already_done", "too_much_effort"].includes(reason);
}

function similarStatement(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  return na.includes(nb) || nb.includes(na) || tokenOverlap(na, nb) >= 0.6;
}

function conflicts(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na.includes("alone") && nb.includes("never") && nb.includes("alone")) return true;
  if (na.includes("love") && nb.includes("dislike") && tokenOverlap(na, nb) > 0.4) return true;
  return false;
}

function tokenOverlap(a: string, b: string) {
  const as = new Set(a.split(" ").filter((t) => t.length > 3));
  const bs = new Set(b.split(" ").filter((t) => t.length > 3));
  if (!as.size || !bs.size) return 0;
  let hit = 0;
  for (const token of as) if (bs.has(token)) hit += 1;
  return hit / Math.max(as.size, bs.size);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
