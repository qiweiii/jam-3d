import assert from "node:assert/strict";
import test from "node:test";
import { createTourPlayback } from "../../../src/playback/tour-playback.ts";
import { PACKAGE_SPEED, PACKAGE_STEPS } from "../../../src/features/package-tour/package-steps.ts";

test("journey speed config shortens steps 1–3 and lengthens steps 4–6", () => {
  const base = [3, 3, 4, 6, 6, 5];
  assert.ok(PACKAGE_SPEED.inCore > 1);
  assert.ok(PACKAGE_SPEED.onChain > 0 && PACKAGE_SPEED.onChain < 1);
  for (const [index, step] of PACKAGE_STEPS.entries()) {
    const speed = index < 3 ? PACKAGE_SPEED.inCore : PACKAGE_SPEED.onChain;
    const hold = "hold" in step ? step.hold : 0;
    assert.equal(step.duration, base[index]! / speed + hold);
  }
});

test("paused playback never advances, including after pausing mid-step", () => {
  const playback = createTourPlayback(PACKAGE_STEPS);
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
  const playback = createTourPlayback(PACKAGE_STEPS);
  playback.play(true);
  for (const step of PACKAGE_STEPS.slice(0, 4)) playback.tick(step.duration);
  assert.equal(playback.snapshot().step.id, "availability");
  assert.equal(playback.snapshot().elapsed, 0);
  playback.tick(PACKAGE_STEPS[4].duration - 0.1);
  assert.equal(playback.snapshot().step.id, "availability");
  playback.tick(0.2);
  assert.equal(playback.snapshot().step.id, "accumulate");
});

test("completion stops at the last step and replay clears elapsed time", () => {
  const playback = createTourPlayback(PACKAGE_STEPS);
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
  const playback = createTourPlayback(PACKAGE_STEPS);
  const step = PACKAGE_STEPS[3];
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
  const playback = createTourPlayback(PACKAGE_STEPS);
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
  const playback = createTourPlayback(PACKAGE_STEPS, { loop: true });
  playback.select(5);
  playback.seek(1000);
  assert.equal(playback.snapshot().index, 5);
  assert.equal(playback.snapshot().elapsed, PACKAGE_STEPS[5].duration);
  assert.equal(playback.snapshot().playing, false);
  playback.seek(-10);
  assert.equal(playback.snapshot().elapsed, 0);
  playback.seek(Number.NaN);
  assert.equal(playback.snapshot().elapsed, 0);
  playback.play(true);
  playback.tick(PACKAGE_STEPS[5].duration);
  assert.equal(playback.snapshot().index, 0);
  assert.equal(playback.snapshot().scrubbed, false);
});

test("looping package playback returns to step one and preserves elapsed overflow", () => {
  const playback = createTourPlayback(PACKAGE_STEPS, { loop: true });
  const duration = PACKAGE_STEPS.reduce((sum, step) => sum + step.duration, 0);
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
  const playback = createTourPlayback(PACKAGE_STEPS, { loop: true });
  playback.select(PACKAGE_STEPS.length - 1);
  playback.play(true);
  playback.tick(1);
  playback.play(false);
  const paused = playback.snapshot();
  playback.tick(1000);
  assert.deepEqual(playback.snapshot(), paused);
});

test("custom tours remain non-looping unless explicitly requested", () => {
  const playback = createTourPlayback([{ duration: 1 }, { duration: 2 }]);
  playback.play(true);
  playback.tick(10);
  assert.equal(playback.loop, false);
  assert.equal(playback.snapshot().index, 1);
  assert.equal(playback.snapshot().elapsed, 2);
  assert.equal(playback.snapshot().playing, false);
});

test("manual navigation clamps at either end and resets the step clock", () => {
  const playback = createTourPlayback(PACKAGE_STEPS);
  playback.select(-1);
  assert.equal(playback.snapshot().index, 0);
  playback.select(100);
  assert.equal(playback.snapshot().index, PACKAGE_STEPS.length - 1);
  assert.equal(playback.snapshot().elapsed, 0);
});
