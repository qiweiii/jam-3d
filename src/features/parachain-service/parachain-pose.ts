import { PARACHAIN_STEPS, type ParachainStep } from "./parachain-steps.ts";

/** An illustrative service story, independent of the general package journey and protocol timing. */
export function deriveParachainPose(step: ParachainStep, elapsed: number, endpoint = false) {
  const animationDuration = step.duration - ("hold" in step ? step.hold : 0);
  const time = Math.max(0, Math.min(step.duration, elapsed));
  const p = endpoint ? 1 : Math.min(1, time / animationDuration);
  const range = (start: number, end: number) => Math.max(0, Math.min(1, (p - start) / (end - start)));
  const stage = PARACHAIN_STEPS.findIndex((entry) => entry.id === step.id);
  const stateLayer: "ρ" | "δ" | "φ" | null = stage < 3 ? null : stage === 3 ? "ρ" : stage === 4 ? "δ" : "φ";
  // Use the tour clock so rings stay continuous across steps and stop with playback.
  const tourTime = PARACHAIN_STEPS.slice(0, stage).reduce((sum, previous) => sum + previous.duration, 0);
  // Separate enactions, rather than suggesting that three parachain heads change atomically.
  const headProgress = [0, 0.16, 0.32].map((offset) =>
    stage > 4 ? 1 : stage === 4 ? range(0.08 + offset, 0.32 + offset) : 0,
  );
  return {
    stage,
    stateLayer,
    ringAngle: endpoint ? 0 : (tourTime + time) * 0.45,
    candidate: stage > 1 ? 1 : stage === 1 ? range(0, 0.8) : 0,
    validation: stage > 2 ? 1 : stage === 2 ? range(0, 0.65) : 0,
    reportOutput: stage > 2 ? 1 : stage === 2 ? range(0.68, 0.9) : 0,
    report: stage > 3 ? 1 : stage === 3 ? range(0.08, 0.45) : 0,
    recorded: stage > 3 || (stage === 3 && p >= 0.45),
    available: stage > 3 || (stage === 3 && p >= 0.82),
    released: stage > 3 ? 1 : stage === 3 ? range(0.82, 1) : 0,
    checks: stage > 4 ? 1 : stage === 4 ? range(0, 0.06) : 0,
    heads: headProgress.reduce((sum, progress) => sum + progress, 0) / headProgress.length,
    headProgress,
    laterBlock: stage > 3 || (stage === 3 && p >= 0.7),
    assignment: stage === 5 ? range(0.08, 0.82) : 0,
  };
}

export type ParachainPose = ReturnType<typeof deriveParachainPose>;

/** Plain-language action headings share the same milestones as the objects they describe. */
export function parachainPhase(frame: ParachainPose) {
  if (frame.stage === 3) {
    const title = frame.available ? "Data available" : frame.recorded ? "Pending availability" : "Signed work-reports";
    const meta = frame.laterBlock ? "Later JAM block" : frame.recorded ? "JAM block N" : "";
    return { title, meta };
  }
  if (frame.stage === 4) {
    return { title: "Accumulate", meta: frame.checks < 1 ? "Check candidates" : "Update parachain heads" };
  }
  return { title: "Apply core allocation", meta: frame.assignment === 1 ? "Queue updated" : "When due" };
}
