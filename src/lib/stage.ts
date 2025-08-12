import { addDays } from "date-fns";
import { Piece, Stage } from "@/types";

export const stageOrder: Stage[] = [
  "throwing",
  "trimming",
  "drying",
  "bisque_firing",
  "glazing",
  "glaze_firing",
  "decorating",
  "finished",
];

const nextMap: Record<Stage, { next: Stage | null; days?: number; note?: string }> = {
  throwing: { next: "trimming", days: 2 },
  trimming: { next: "drying", days: 4 },
  drying: { next: "bisque_firing" }, // when bone-dry; no default days
  bisque_firing: { next: "glazing", days: 2 },
  glazing: { next: "glaze_firing", days: 3 },
  glaze_firing: { next: "decorating", days: 2 },
  decorating: { next: "finished", days: 1 },
  finished: { next: null },
};

export function suggestNextStep(stage: Stage, from: Date = new Date()): {
  next_step?: string;
  next_reminder_at?: string | null;
} {
  const rule = nextMap[stage];
  if (!rule.next) return { next_step: undefined, next_reminder_at: null };
  const due = rule.days ? addDays(from, rule.days) : null;
  return {
    next_step: `Move to ${rule.next.replace("_", " ")}`,
    next_reminder_at: due ? due.toISOString() : null,
  };
}

export function advanceStage(piece: Piece): Piece {
  const currentIndex = stageOrder.indexOf(piece.current_stage);
  const next = nextMap[piece.current_stage].next ?? piece.current_stage;
  const newHistory = [
    ...(piece.stage_history ?? []),
    { stage: piece.current_stage, date: new Date().toISOString() },
  ];
  const suggestion = suggestNextStep(next);
  return {
    ...piece,
    current_stage: next,
    stage_history: newHistory,
    next_step: suggestion.next_step,
    next_reminder_at: suggestion.next_reminder_at ?? null,
  };
}
