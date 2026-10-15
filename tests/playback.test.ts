import assert from "node:assert/strict";
import test from "node:test";
import { createJourneyPlayback } from "../src/experience/playback.ts";
import { JOURNEY_SPEED, JOURNEY_STEPS } from "../src/content/journey.ts";
import { STATE_COMPONENTS } from "../src/content/state.ts";
import { wheelDollyAmount } from "../src/experience/input.ts";

test("journey speed config shortens steps 1–3 and lengthens steps 4–6", () => {
  const base = [3, 3, 4, 6, 6, 5];
  assert.ok(JOURNEY_SPEED.inCore > 1);
  assert.ok(JOURNEY_SPEED.onChain > 0 && JOURNEY_SPEED.onChain < 1);
  for (const [index, step] of JOURNEY_STEPS.entries()) {
    const speed = index < 3 ? JOURNEY_SPEED.inCore : JOURNEY_SPEED.onChain;
    const hold = "hold" in step ? step.hold : 0;
    assert.equal(step.duration, base[index]! / speed + hold);
  }
});

test("paused playback never advances, including after pausing mid-step", () => {
  const playback = createJourneyPlayback();
  playback.tick(100);
  assert.equal(playback.snapshot().elapsed, 0);
  playback.play(true);
  playback.tick(1);
  playback.play(false);
  playback.tick(100);
  assert.equal(playback.snapshot().elapsed, 1);
  assert.equal(playback.snapshot().step.id, "package");
});

test("the successful example holds at availability before accumulation", () => {
  const playback = createJourneyPlayback();
  playback.play(true);
  for (const step of JOURNEY_STEPS.slice(0, 4)) playback.tick(step.duration);
  assert.equal(playback.snapshot().step.id, "availability");
  assert.equal(playback.snapshot().elapsed, 0);
  playback.tick(JOURNEY_STEPS[4].duration - 0.1);
  assert.equal(playback.snapshot().step.id, "availability");
  playback.tick(0.2);
  assert.equal(playback.snapshot().step.id, "accumulate");
});

test("completion stops at the last step and replay clears elapsed time", () => {
  const playback = createJourneyPlayback();
  playback.play(true);
  playback.tick(1000);
  assert.equal(playback.snapshot().step.id, "accumulate");
  assert.equal(playback.snapshot().playing, false);
  assert.equal(playback.snapshot().elapsed, playback.snapshot().step.duration);
  playback.restart();
  assert.equal(playback.snapshot().step.id, "package");
  assert.equal(playback.snapshot().elapsed, 0);
});

test("step four holds for reading before advancing, and can be paused during the hold", () => {
  const playback = createJourneyPlayback();
  const step = JOURNEY_STEPS[3];
  playback.select(3);
  playback.play(true);
  playback.tick(step.duration - step.hold);
  playback.tick(step.hold / 2);
  assert.equal(playback.snapshot().index, 3);
  playback.play(false);
  const paused = playback.snapshot();
  playback.tick(100);
  assert.deepEqual(playback.snapshot(), paused);
  playback.play(true);
  playback.tick(step.hold / 2 + 0.01);
  assert.equal(playback.snapshot().index, 4);
});

test("seeking pauses within the current step and Play resumes from that point", () => {
  const playback = createJourneyPlayback();
  playback.select(3);
  playback.play(true);
  playback.seek(2);
  assert.equal(playback.snapshot().index, 3);
  assert.equal(playback.snapshot().elapsed, 2);
  assert.equal(playback.snapshot().playing, false);
  assert.equal(playback.snapshot().scrubbed, true);
  playback.tick(100);
  assert.equal(playback.snapshot().elapsed, 2);
  playback.play(true);
  playback.tick(0.5);
  assert.equal(playback.snapshot().elapsed, 2.5);
  playback.select(2);
  assert.equal(playback.snapshot().elapsed, 0);
  assert.equal(playback.snapshot().scrubbed, false);
});

test("seeking clamps at step boundaries without advancing or looping", () => {
  const playback = createJourneyPlayback(JOURNEY_STEPS, { loop: true });
  playback.select(5);
  playback.seek(1000);
  assert.equal(playback.snapshot().index, 5);
  assert.equal(playback.snapshot().elapsed, JOURNEY_STEPS[5].duration);
  assert.equal(playback.snapshot().playing, false);
  playback.seek(-10);
  assert.equal(playback.snapshot().elapsed, 0);
  playback.seek(Number.NaN);
  assert.equal(playback.snapshot().elapsed, 0);
  playback.play(true);
  playback.tick(JOURNEY_STEPS[5].duration);
  assert.equal(playback.snapshot().index, 0);
  assert.equal(playback.snapshot().scrubbed, false);
});

test("looping package playback returns to step one and preserves elapsed overflow", () => {
  const playback = createJourneyPlayback(JOURNEY_STEPS, { loop: true });
  const duration = JOURNEY_STEPS.reduce((sum, step) => sum + step.duration, 0);
  playback.play(true);
  playback.tick(duration + 0.25);
  assert.equal(playback.loop, true);
  assert.equal(playback.snapshot().index, 0);
  assert.ok(Math.abs(playback.snapshot().elapsed - 0.25) < 1e-9);
  assert.equal(playback.snapshot().playing, true);
  playback.tick(duration * 3);
  assert.equal(playback.snapshot().index, 0);
  assert.ok(Math.abs(playback.snapshot().elapsed - 0.25) < 1e-9);
});

test("pausing a looping journey holds the final step instead of restarting", () => {
  const playback = createJourneyPlayback(JOURNEY_STEPS, { loop: true });
  playback.select(JOURNEY_STEPS.length - 1);
  playback.play(true);
  playback.tick(1);
  playback.play(false);
  const paused = playback.snapshot();
  playback.tick(1000);
  assert.deepEqual(playback.snapshot(), paused);
});

test("custom tours remain non-looping unless explicitly requested", () => {
  const playback = createJourneyPlayback([{ duration: 1 }, { duration: 2 }]);
  playback.play(true);
  playback.tick(10);
  assert.equal(playback.loop, false);
  assert.equal(playback.snapshot().index, 1);
  assert.equal(playback.snapshot().elapsed, 2);
  assert.equal(playback.snapshot().playing, false);
});

test("manual navigation clamps at either end and resets the step clock", () => {
  const playback = createJourneyPlayback();
  playback.select(-1);
  assert.equal(playback.snapshot().index, 0);
  playback.select(100);
  assert.equal(playback.snapshot().index, JOURNEY_STEPS.length - 1);
  assert.equal(playback.snapshot().elapsed, 0);
});

test("state inventory matches Gray Paper 0.8.0 §4.2, independently of STF operations", () => {
  assert.deepEqual(
    STATE_COMPONENTS.map((component) => component.symbol),
    ["α", "β", "θ", "γ", "δ", "η", "ι", "κ", "λ", "ρ", "τ", "φ", "χ", "ψ", "π", "ω", "ξ"],
  );
});

test("pinch wheel input is inverted for camera dolly and never falls through to page zoom", () => {
  assert.equal(wheelDollyAmount(100, 0, 720, true), -0.26);
  assert.equal(wheelDollyAmount(-100, 0, 720, true), 0.26);
  assert.equal(wheelDollyAmount(1, 1, 720, false), 0.0416);
  assert.equal(wheelDollyAmount(0, 0, 720, true), 0);
});
