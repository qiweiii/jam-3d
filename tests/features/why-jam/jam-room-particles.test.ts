import assert from "node:assert/strict";
import test from "node:test";
import { Group } from "three";
import { buildPodDust, deriveRoomPose, updateJamPods } from "../../../src/features/why-jam/jam-room-particles.ts";

test("Why JAM pods form, stay occupied, dissolve and repeat on the same cycle", () => {
  assert.deepEqual(deriveRoomPose(0, 0), { assembled: 1, scatter: 1, dustOpacity: 0.35 });
  assert.deepEqual(deriveRoomPose(3, 0), { assembled: 1, scatter: 0, dustOpacity: 0 });
  const dissolving = deriveRoomPose(5.7, 0);
  assert.equal(dissolving.assembled, 1);
  assert.ok(dissolving.scatter > 0 && dissolving.scatter < 1);
  assert.deepEqual(deriveRoomPose(7, 0), { assembled: 0, scatter: 1, dustOpacity: 0 });
  assert.deepEqual(deriveRoomPose(3, 2), deriveRoomPose(5, 0));
  assert.deepEqual(deriveRoomPose(3, 0), deriveRoomPose(11, 0));
});

test("pod dust is seeded and a scene fade does not alter its animation pose", () => {
  const first = buildPodDust(new Group(), 0.5, 0.42, 0.45, 1);
  const second = buildPodDust(new Group(), 0.5, 0.42, 0.45, 1);
  assert.deepEqual(first.rest, second.rest);
  assert.deepEqual(first.burst, second.burst);
  const pod = { ...first, group: new Group(), joins: [], phase: 0 };
  updateJamPods([pod], 0, 1);
  const positions = pod.dust.geometry.getAttribute("position").array.slice();
  assert.equal(pod.dust.visible, true);
  assert.equal(pod.dust.material.opacity, 0.35);
  updateJamPods([pod], 0, 0);
  assert.deepEqual(pod.dust.geometry.getAttribute("position").array, positions);
  assert.equal(pod.dust.visible, false);
  updateJamPods([pod], 7, 1);
  assert.equal(pod.group.visible, false);
});
