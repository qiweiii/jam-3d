import assert from "node:assert/strict";
import test from "node:test";
import { PARACHAIN_HOLD, PARACHAIN_STEPS } from "../src/content/parachain.ts";
import { parachainFrame, parachainPhase } from "../src/experience/parachain-state.ts";
import { createJourneyPlayback } from "../src/experience/playback.ts";
import { LODS } from "../src/experience/stages.ts";

const sample = (index: number, progress = 1) => {
  const step = PARACHAIN_STEPS[index]!;
  const animationDuration = step.duration - ("hold" in step ? step.hold : 0);
  return parachainFrame(step, animationDuration * progress);
};

test("parachain service is separate from the general zoom chain", () => {
  assert.deepEqual(LODS, ["machine", "core", "package", "block", "stf"]);
});

test("collection and validation leave accepted heads unchanged", () => {
  assert.equal(sample(1).candidate, 1);
  assert.equal(sample(2).validation, 1);
  assert.equal(sample(2).heads, 0);
  assert.equal(sample(2).recorded, false);
});

test("validation finishes before its report emerges, without updating host records", () => {
  assert.equal(sample(1).reportOutput, 0);
  const checked = sample(2, 0.65);
  assert.equal(checked.validation, 1);
  assert.equal(checked.reportOutput, 0);
  const emerging = sample(2, 0.8);
  assert.equal(emerging.validation, 1);
  assert.ok(emerging.reportOutput > 0 && emerging.reportOutput < 1);
  assert.equal(emerging.heads, 0);
  assert.equal(emerging.recorded, false);
  assert.equal(sample(2).reportOutput, 1);
  assert.equal(sample(3, 0).reportOutput, 1);
  assert.equal(sample(3, 0).report, 0);
});

test("report inclusion precedes availability, neither enacts a parachain head", () => {
  assert.equal(sample(3, 0.3).recorded, false);
  const pending = sample(3, 0.6);
  assert.equal(pending.recorded, true);
  assert.equal(pending.available, false);
  assert.equal(pending.heads, 0);
  const available = sample(3);
  assert.equal(available.available, true);
  assert.equal(available.heads, 0);
});

test("accumulation checks pass before heads and requested effects are applied", () => {
  assert.equal(sample(4, 0.08).heads, 0);
  assert.equal(sample(4, 0.09).checks, 1);
  assert.ok(sample(4, 0.1).heads > 0);
  assert.ok(sample(4, 0.41).headProgress.every((progress) => progress > 0));
  assert.equal(sample(4).heads, 1);
  assert.equal(sample(4).assignment, 0);
});

test("heads advance separately, without suggesting an atomic update across parachains", () => {
  const early = sample(4, 0.35);
  assert.equal(early.headProgress[0], 1);
  assert.ok(early.headProgress[1]! > 0 && early.headProgress[1]! < 1);
  assert.equal(early.headProgress[2], 0);
  assert.deepEqual(sample(4).headProgress, [1, 1, 1]);
});

test("a later block is shown before reports become available", () => {
  const later = sample(3, 0.75);
  assert.equal(later.recorded, true);
  assert.equal(later.laterBlock, true);
  assert.equal(later.available, false);
});

test("main captions are short and keep ABI details in optional notes", () => {
  for (const step of PARACHAIN_STEPS) {
    assert.ok(step.body.length <= 180, `${step.id}: ${step.body.length} characters`);
    assert.doesNotMatch(step.body, /AssignCore|ParachainWorkDigest|historical_lookup|child PVM/);
  }
});

test("service captions distinguish parachain candidates and heads from JAM blocks", () => {
  assert.match(PARACHAIN_STEPS[1].body, /parachain block candidate/);
  assert.match(PARACHAIN_STEPS[2].body, /proposed parachain head/);
  assert.match(PARACHAIN_STEPS[2].body, /work-report carries the result/);
  assert.equal(PARACHAIN_STEPS[3].title, "Confirm data availability");
  assert.match(PARACHAIN_STEPS[3].body, /later JAM block/);
  assert.match(PARACHAIN_STEPS[3].body, /pending-report state/);
  assert.match(PARACHAIN_STEPS[4].title, /parachain heads/);
  assert.match(PARACHAIN_STEPS[5].body, /Coretime's accepted parachain block/);
});

test("the Coretime decision is applied after the candidate has been enacted", () => {
  assert.equal(sample(5, 0).heads, 1);
  assert.equal(sample(5, 0).assignment, 0);
  assert.equal(sample(5).assignment, 1);
});

test("reports, service updates and core allocation focus the matching JAM state component", () => {
  assert.equal(sample(2).stateLayer, null);
  assert.equal(sample(3).stateLayer, "ρ");
  assert.equal(sample(4).stateLayer, "δ");
  assert.equal(sample(5).stateLayer, "φ");
  assert.equal(sample(3, 0.81).released, 0);
  assert.ok(sample(3, 0.9).released > 0);
  assert.equal(sample(3).released, 1);
});

test("action labels distinguish signing, recorded reports and later-block availability", () => {
  assert.deepEqual(parachainPhase(sample(3, 0)), { title: "Signed work-reports", meta: "" });
  assert.deepEqual(parachainPhase(sample(3, 0.6)), { title: "Pending availability", meta: "JAM block N" });
  assert.deepEqual(parachainPhase(sample(3, 0.75)), { title: "Pending availability", meta: "Later JAM block" });
  assert.deepEqual(parachainPhase(sample(3)), { title: "Data available", meta: "Later JAM block" });
  assert.equal(parachainPhase(sample(4, 0)).meta, "Check candidates");
  assert.equal(parachainPhase(sample(4)).meta, "Update parachain heads");
  assert.equal(parachainPhase(sample(5, 0)).meta, "When due");
  assert.equal(parachainPhase(sample(5)).meta, "Queue updated");
});

test("step four holds the ready reports for three seconds without slowing the preceding animation", () => {
  const step = PARACHAIN_STEPS[3];
  const animationDuration = step.duration - step.hold;
  assert.equal(animationDuration, 7);
  assert.equal(step.hold, 3);
  assert.equal(step.hold, PARACHAIN_HOLD.afterAvailability);
  const completed = parachainFrame(step, animationDuration);
  const holding = parachainFrame(step, step.duration - 0.1);
  assert.equal(completed.released, 1);
  assert.deepEqual({ ...holding, ringAngle: 0 }, { ...completed, ringAngle: 0 });
  const playback = createJourneyPlayback(PARACHAIN_STEPS);
  playback.select(3);
  playback.play(true);
  playback.tick(animationDuration + step.hold - 0.1);
  assert.equal(playback.snapshot().index, 3);
  playback.tick(0.2);
  assert.equal(playback.snapshot().index, 4);
});

test("reduced motion, scrubbing and restarting derive deterministic service poses", () => {
  for (const step of PARACHAIN_STEPS) {
    assert.deepEqual(parachainFrame(step, 0, true), { ...parachainFrame(step, step.duration), ringAngle: 0 });
  }
  const playback = createJourneyPlayback(PARACHAIN_STEPS);
  playback.select(4);
  playback.seek(PARACHAIN_STEPS[4].duration * 0.06);
  const paused = playback.snapshot();
  playback.tick(100);
  assert.deepEqual(playback.snapshot(), paused);
  assert.equal(parachainFrame(paused.step, paused.elapsed).heads, 0);
  playback.restart();
  assert.deepEqual(parachainFrame(playback.snapshot().step, 0), sample(0, 0));
});

test("core rings rotate continuously across steps and follow paused or scrubbed playback", () => {
  for (let index = 0; index < PARACHAIN_STEPS.length - 1; index++) {
    assert.ok(sample(index).ringAngle > sample(index, 0).ringAngle);
    const step = PARACHAIN_STEPS[index]!;
    assert.equal(parachainFrame(step, step.duration).ringAngle, sample(index + 1, 0).ringAngle);
  }
  const playback = createJourneyPlayback(PARACHAIN_STEPS);
  const angle = () => {
    const state = playback.snapshot();
    return parachainFrame(state.step, state.elapsed).ringAngle;
  };
  playback.play(true);
  playback.tick(2);
  assert.ok(angle() > 0);
  playback.play(false);
  const pausedAngle = angle();
  playback.tick(2);
  assert.equal(angle(), pausedAngle);
  playback.seek(1);
  assert.equal(angle(), sample(0, 1 / PARACHAIN_STEPS[0].duration).ringAngle);
});
