import assert from "node:assert/strict";
import test from "node:test";
import { PerspectiveCamera, Vector3 } from "three";
import { createCameraMotion } from "../../src/graphics/camera-motion.ts";

function setup() {
  const camera = new PerspectiveCamera();
  camera.position.set(0, 0, 10);
  const controls = {
    target: new Vector3(),
    enabled: true,
    minDistance: 2,
    maxDistance: 20,
    update: () => false,
  };
  const motion = createCameraMotion(camera, controls);
  const frame = { position: new Vector3(0, 0, 5), target: new Vector3(), minDist: 2, maxDist: 20 };
  return { camera, controls, motion, frame };
}

test("instant camera navigation lands on the destination and restores orbit limits", () => {
  const { camera, controls, motion, frame } = setup();
  motion.flyTo(frame, false);
  assert.deepEqual(camera.position, frame.position);
  assert.deepEqual(controls.target, frame.target);
  assert.equal(motion.isMoving(), false);
  assert.equal(controls.enabled, true);
  assert.equal(controls.minDistance, frame.minDist);
  assert.equal(controls.maxDistance, frame.maxDist);
  assert.equal(motion.update(1), null);
});

test("animated flights disable input, return fade progress and settle at the destination", () => {
  const { camera, controls, motion, frame } = setup();
  motion.flyTo(frame, true);
  assert.equal(controls.enabled, false);
  assert.equal(motion.isMoving(), true);
  assert.equal(motion.dolly(1, frame, true, true), 0);
  assert.equal(camera.position.z, 10);
  const progress = motion.update(0.1)!;
  assert.ok(progress > 0 && progress < 1);
  assert.ok(camera.position.z > 5 && camera.position.z < 10);
  assert.equal(motion.update(2), 1);
  assert.ok(camera.position.distanceTo(frame.position) < 1e-10);
  assert.equal(motion.isMoving(), false);
  assert.equal(controls.enabled, true);
  assert.equal(controls.minDistance, frame.minDist);
});

test("dolly crossing requires sustained pressure and independent scenes only clamp", () => {
  const { camera, motion, frame } = setup();
  camera.position.z = frame.minDist;
  assert.equal(motion.dolly(0.15, frame, true, false), 0);
  assert.equal(motion.dolly(0.15, frame, true, false), 1);
  motion.flyTo(frame, false);
  camera.position.z = frame.maxDist;
  assert.equal(motion.dolly(-0.3, frame, false, true), -1);
  motion.flyTo(frame, false);
  assert.equal(motion.dolly(10, frame, false, false), 0);
  assert.equal(camera.position.z, frame.minDist);
  assert.equal(motion.dolly(-10, frame, false, false), 0);
  assert.equal(camera.position.z, frame.maxDist);
});

test("resizing preserves manual camera offsets and scales an in-flight destination", () => {
  const { camera, controls, motion, frame } = setup();
  controls.target.set(1, 2, 3);
  camera.position.set(4, 6, 8);
  const offset = camera.position.clone().sub(controls.target);
  motion.resize(2, frame);
  assert.ok(camera.position.clone().sub(controls.target).distanceTo(offset.multiplyScalar(2)) < 1e-10);
  motion.flyTo(frame, true);
  motion.update(0.1);
  const resized = { ...frame, position: frame.position.clone().multiplyScalar(2), minDist: 4, maxDist: 40 };
  motion.resize(2, resized);
  motion.update(2);
  assert.ok(camera.position.distanceTo(resized.position) < 1e-10);
  assert.equal(controls.minDistance, 4);
  assert.equal(controls.maxDistance, 40);
});
