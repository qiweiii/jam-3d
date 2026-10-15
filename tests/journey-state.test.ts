import assert from "node:assert/strict";
import test from "node:test";
import { JOURNEY_STEPS } from "../src/content/journey.ts";
import { journeyFrame } from "../src/experience/journey-state.ts";

const sample = (index: number, progress: number, reduce = false) => {
  const step = JOURNEY_STEPS[index]!;
  return journeyFrame(step, progress * step.duration, reduce);
};

test("guarantors sign before the report moves on-chain", () => {
  const signing = sample(3, 0.1);
  assert.equal(signing.phase, "sign");
  assert.equal(signing.path, 0.55);
  assert.equal(signing.recorded, false);
  assert.equal(signing.blockAdvance, 0);
  const reporting = sample(3, 0.3);
  assert.equal(reporting.signed, 1);
  assert.equal(reporting.phase, "report");
  assert.equal(reporting.recorded, false);
  assert.ok(reporting.path > signing.path);
});

test("inclusion dissolves the travelling report but leaves pending state", () => {
  const included = sample(3, 1);
  assert.equal(included.recorded, true);
  assert.equal(included.path, 1);
  assert.equal(included.packetOpacity, 0);
  assert.equal(included.pendingOpacity, 1);
  assert.equal(included.available, false);
  assert.equal(included.accumulation, 0);
  assert.equal(included.blockAdvance, 0);
});

test("step four holds its completed inclusion state without stretching the preceding animation", () => {
  const step = JOURNEY_STEPS[3];
  const animationDuration = step.duration - step.hold;
  const endpoint = journeyFrame(step, animationDuration);
  assert.equal(endpoint.recorded, true);
  assert.equal(endpoint.packetOpacity, 0);
  assert.equal(endpoint.pendingOpacity, 1);
  assert.deepEqual(journeyFrame(step, animationDuration + step.hold / 2), endpoint);
  assert.deepEqual(journeyFrame(step, step.duration), endpoint);
});

test("step four reaches the block sooner and reserves its final seconds for reading", () => {
  const step = JOURNEY_STEPS[3];
  const animationDuration = step.duration - step.hold;
  const arrived = journeyFrame(step, animationDuration * 0.5);
  assert.equal(arrived.path, 1);
  assert.equal(arrived.recorded, true);
  assert.equal(arrived.phase, "pending");
  const settled = journeyFrame(step, animationDuration * 0.7);
  assert.equal(settled.packetOpacity, 0);
  assert.equal(settled.pendingOpacity, 1);
  assert.deepEqual(settled, journeyFrame(step, step.duration));
  assert.equal(step.duration - animationDuration * 0.7, 3.25);
});

test("a later block appears before its assurances release the report", () => {
  const waiting = sample(4, 0.26);
  assert.equal(waiting.blockAdvance, 1);
  assert.equal(waiting.assurance, 0);
  assert.equal(waiting.available, false);
  assert.equal(waiting.pendingOpacity, 1);
  assert.equal(waiting.release, 0);
  const assured = sample(4, 1);
  assert.equal(assured.available, true);
  assert.equal(assured.assurance, 1);
  assert.equal(assured.accumulation, 0);
  assert.equal(assured.release, 1);
});

test("the pending snapshot remains recorded while the available report is released", () => {
  const releasing = sample(4, 0.95);
  assert.equal(releasing.recorded, true);
  assert.equal(releasing.available, true);
  assert.ok(releasing.release > 0 && releasing.release < 1);
  assert.equal(releasing.accumulation, 0);
  const applied = sample(5, 1);
  assert.equal(applied.recorded, true);
  assert.equal(applied.release, 1);
});

test("accumulation changes state in the later block without resubmitting the report", () => {
  const applied = sample(5, 1);
  assert.equal(applied.blockAdvance, 1);
  assert.equal(applied.recorded, true);
  assert.equal(applied.packetOpacity, 0);
  assert.equal(applied.pendingOpacity, 0);
  assert.equal(applied.accumulation, 1);
  assert.equal(applied.phase, "applied");
});

test("manual selection and replay restore the exact earlier visual state", () => {
  const signing = sample(3, 0.1);
  sample(5, 1);
  assert.deepEqual(sample(3, 0.1), signing);
  const restarted = sample(0, 0);
  assert.equal(restarted.report, false);
  assert.equal(restarted.recorded, false);
  assert.equal(restarted.blockAdvance, 0);
  assert.equal(restarted.pendingOpacity, 0);
  assert.equal(restarted.assurance, 0);
});

test("reduced motion shows a legible endpoint for each step", () => {
  for (let index = 0; index < JOURNEY_STEPS.length; index++) {
    assert.deepEqual(sample(index, 0, true), sample(index, 1));
  }
});
