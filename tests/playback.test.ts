import assert from "node:assert/strict";
import test from "node:test";
import { createJourneyPlayback } from "../src/experience/playback.ts";
import { JOURNEY_STEPS } from "../src/content/journey.ts";
import { STATE_COMPONENTS } from "../src/content/state.ts";
import { wheelDollyAmount } from "../src/experience/input.ts";

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
  const beforeAvailability = JOURNEY_STEPS.slice(0, 4).reduce((sum, step) => sum + step.duration, 0);
  playback.tick(beforeAvailability);
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
