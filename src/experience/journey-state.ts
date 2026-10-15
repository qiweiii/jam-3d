import type { JourneyStep } from "./playback.ts";

/** Presentation milestones for one successful example, not a protocol clock. */
export type JourneyFrame = {
  phase:
    | "package"
    | "authorize"
    | "refine"
    | "sign"
    | "report"
    | "pending"
    | "assure"
    | "available"
    | "accumulate"
    | "applied";
  path: number;
  report: boolean;
  signed: number;
  packetOpacity: number;
  recorded: boolean;
  pendingOpacity: number;
  blockAdvance: number;
  assurance: number;
  available: boolean;
  release: number;
  accumulation: number;
};

export function journeyFrame(step: JourneyStep, elapsed: number, reduce = false): JourneyFrame {
  const animationDuration = step.duration - ("hold" in step ? step.hold : 0);
  const p = reduce ? 1 : Math.max(0, Math.min(1, elapsed / animationDuration));
  const range = (start: number, end: number) => Math.max(0, Math.min(1, (p - start) / (end - start)));
  const frame: JourneyFrame = {
    phase: "package",
    path: 0,
    report: step.report,
    signed: 0,
    packetOpacity: 1,
    recorded: false,
    pendingOpacity: 0,
    blockAdvance: 0,
    assurance: 0,
    available: false,
    release: 0,
    accumulation: 0,
  };
  switch (step.id) {
    case "package":
      frame.path = p * 0.22;
      break;
    case "authorize":
      frame.phase = "authorize";
      frame.path = 0.22;
      break;
    case "refine":
      frame.phase = "refine";
      frame.path = 0.22 + p * 0.33;
      break;
    case "guarantee":
      // Keep the trip brief; spend the remaining time on inclusion and pending state.
      frame.phase = p < 0.22 ? "sign" : p < 0.5 ? "report" : "pending";
      frame.signed = range(0, 0.22);
      frame.path = 0.55 + range(0.22, 0.5) * 0.45;
      frame.recorded = p >= 0.5;
      frame.pendingOpacity = range(0.5, 0.7);
      frame.packetOpacity = 1 - frame.pendingOpacity;
      break;
    case "availability":
      frame.phase = p < 0.28 ? "pending" : p < 0.9 ? "assure" : "available";
      frame.path = 1;
      frame.signed = 1;
      frame.packetOpacity = 0;
      frame.recorded = true;
      frame.pendingOpacity = 1;
      frame.blockAdvance = range(0, 0.25);
      frame.assurance = range(0.28, 0.88);
      frame.available = p >= 0.9;
      frame.release = range(0.9, 1);
      break;
    case "accumulate":
      frame.phase = p < 0.75 ? "accumulate" : "applied";
      frame.path = 1;
      frame.signed = 1;
      frame.packetOpacity = 0;
      frame.recorded = true;
      frame.blockAdvance = 1;
      frame.assurance = 1;
      frame.available = true;
      frame.release = 1;
      frame.accumulation = range(0, 0.75);
      frame.pendingOpacity = 1 - frame.accumulation;
      break;
  }
  return frame;
}
