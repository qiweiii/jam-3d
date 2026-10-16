import assert from "node:assert/strict";
import test from "node:test";
import { Vector3 } from "three";
import { PARACHAIN_HEAD, parachainHeadPosition, parachainReportPaths } from "../src/scene/parachain-paths.ts";
import { buildStateCylinder } from "../src/scene/state-cylinder.ts";

test("reports follow continuous paths from their originating core through pending state into host storage", () => {
  const pending = buildStateCylinder()
    .point("ρ")
    .add(new Vector3(2.5, 1.1, 0));
  for (const index of [0, 1, 2]) {
    const x = (index - 1) * 2.15;
    const paths = parachainReportPaths(index, x, pending);
    assert.ok(paths.outputPath.getPointAt(0).distanceTo(new Vector3(x, 1.55, 0.45)) < 1e-10);
    assert.ok(paths.outputPath.getPointAt(1).distanceTo(paths.reportPath.getPoint(0)) < 1e-10);
    assert.ok(paths.reportPath.getPoint(1).distanceTo(paths.releasePath.getPoint(0)) < 1e-10);
    assert.ok(paths.releasePath.getPoint(1).distanceTo(paths.accumulatePath.getPointAt(0)) < 1e-10);
    assert.ok(paths.accumulatePath.getPointAt(1).distanceTo(parachainHeadPosition(x)) < 1e-10);
    assert.ok(Math.abs(paths.reportPath.getPoint(1).y - pending.y) < 1e-10);
  }
});

test("head records are aligned on one level and depth plane within the host enclosure", () => {
  const positions = [0, 1, 2].map((index) => parachainHeadPosition((index - 1) * 2.15));
  for (const [index, point] of positions.entries()) {
    assert.equal(point.y, PARACHAIN_HEAD.y);
    assert.equal(point.z, 0);
    assert.ok(point.z - PARACHAIN_HEAD.depth / 2 > -0.6);
    assert.ok(point.z + PARACHAIN_HEAD.depth / 2 < 0.5);
    if (index > 0) assert.ok(point.x - positions[index - 1]!.x > 0.82);
  }
});

test("reports travel directly toward pending state without looping through other state layers", () => {
  const pending = new Vector3(2.5, 0.96, 0.72);
  for (const index of [0, 1, 2]) {
    const { reportPath } = parachainReportPaths(index, (index - 1) * 2.15, pending);
    let previousX = Number.NEGATIVE_INFINITY;
    for (const point of reportPath.getPoints(40)) {
      assert.ok(point.x >= previousX - 1e-10);
      assert.ok(point.y >= pending.y - 0.01 && point.y <= 1.4);
      previousX = point.x;
    }
  }
});

test("report entry takes one short continuous path without the far-left detour", () => {
  const pending = new Vector3(2.5, 0.96, 0.72);
  for (const index of [0, 1, 2]) {
    const { accumulatePath } = parachainReportPaths(index, (index - 1) * 2.15, pending);
    const directDistance = accumulatePath.getPoint(0).distanceTo(accumulatePath.getPoint(1));
    assert.ok(accumulatePath.getLength() < directDistance * 1.45);
    for (const point of accumulatePath.getPoints(40)) {
      assert.ok(point.x > -2.7);
      assert.ok(point.y < -1.95 || point.y > -1.1 || Math.abs(point.x) > 1.5);
    }
  }
});
