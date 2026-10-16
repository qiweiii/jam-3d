import assert from "node:assert/strict";
import test from "node:test";
import { createTourPlayback } from "../../src/playback/tour-playback.ts";

const steps = [
  { id: "first", duration: 1 },
  { id: "second", duration: 2 },
] as const;

test("generic playback retains caller metadata and supports independent instances", () => {
  const first = createTourPlayback(steps);
  const second = createTourPlayback([{ title: "Different exhibit", duration: 3 }]);
  first.play(true);
  first.tick(1.25);
  assert.equal(first.snapshot().step.id, "second");
  assert.equal(first.snapshot().elapsed, 0.25);
  assert.equal(second.snapshot().step.title, "Different exhibit");
  assert.equal(second.snapshot().elapsed, 0);
  assert.equal(second.snapshot().playing, false);
});

test("generic loop, scrub and replay policies do not require Package content", () => {
  const playback = createTourPlayback(steps, { loop: true });
  playback.play(true);
  playback.tick(6.5);
  assert.equal(playback.snapshot().index, 0);
  assert.equal(playback.snapshot().elapsed, 0.5);
  playback.seek(1);
  playback.tick(10);
  assert.equal(playback.snapshot().elapsed, 1);
  assert.equal(playback.snapshot().scrubbed, true);
  playback.restart();
  assert.equal(playback.snapshot().elapsed, 0);
  assert.equal(playback.snapshot().scrubbed, false);
});
