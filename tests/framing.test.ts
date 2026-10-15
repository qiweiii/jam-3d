import assert from "node:assert/strict";
import test from "node:test";
import { Vector3 } from "three";
import { cameraScale, frameForViewport } from "../src/experience/framing.ts";
import type { LodId } from "../src/experience/stages.ts";

const stages: LodId[] = ["machine", "core", "package", "block", "stf", "why"];

test("desktop framing stays unchanged except for a closer STF view", () => {
  for (const id of stages) assert.equal(cameraScale(id, 1440, 900), id === "stf" ? 0.9 : 1);
});

test("desktop STF zoom does not affect phones or portrait tablets", () => {
  assert.equal(cameraScale("stf", 844, 390), 1);
  assert.equal(cameraScale("stf", 390, 844), (0.8 * 844) / 390);
  assert.equal(cameraScale("stf", 768, 1024), (0.8 * 1024) / 768);
});

test("each scene pulls back on portrait phones and tablets", () => {
  for (const id of stages) {
    assert.ok(cameraScale(id, 390, 844) > cameraScale(id, 768, 1024));
    assert.ok(cameraScale(id, 768, 1024) > 1);
    assert.equal(cameraScale(id, 844, 390), 1);
  }
  assert.ok(cameraScale("package", 390, 844) > cameraScale("machine", 390, 844));
});

test("fitting preserves the target, direction and relative dolly limits without mutating the frame", () => {
  const frame = {
    id: "core" as const,
    label: "core",
    position: new Vector3(-2, 3, 8),
    target: new Vector3(1, 1, 2),
    minDist: 1,
    maxDist: 12,
  };
  const fitted = frameForViewport(frame, 390, 844);
  const scale = cameraScale(frame.id, 390, 844);
  assert.deepEqual(fitted.target, frame.target);
  assert.ok(
    fitted.position
      .clone()
      .sub(fitted.target)
      .normalize()
      .distanceTo(frame.position.clone().sub(frame.target).normalize()) < 1e-12,
  );
  assert.equal(fitted.minDist, frame.minDist * scale);
  assert.equal(fitted.maxDist, frame.maxDist * scale);
  assert.ok(
    Math.abs(fitted.position.distanceTo(fitted.target) / frame.position.distanceTo(frame.target) - scale) < 1e-12,
  );
  assert.deepEqual(frame.position, new Vector3(-2, 3, 8));
  assert.notEqual(fitted.target, frame.target);
});

test("rotation scaling round-trips a manually zoomed and orbited camera", () => {
  for (const id of stages) {
    const target = new Vector3(2, 1, 0);
    const camera = new Vector3(5, 6, 7);
    const original = camera.clone();
    const ratio = cameraScale(id, 390, 844) / cameraScale(id, 844, 390);
    camera.sub(target).multiplyScalar(ratio).add(target);
    camera
      .sub(target)
      .multiplyScalar(1 / ratio)
      .add(target);
    assert.ok(camera.distanceTo(original) < 1e-12);
  }
});

test("zero-size viewports do not produce infinite camera distances", () => {
  for (const id of stages) {
    assert.equal(cameraScale(id, 0, 844), 1);
    assert.equal(cameraScale(id, 390, 0), 1);
  }
});
