import assert from "node:assert/strict";
import test from "node:test";
import { viewIndex, stepView } from "../../src/app/view-catalog.ts";
import { VIEW_IDS } from "../../src/app/view-catalog.ts";
import { CAMERA_PRESETS } from "../../src/app/camera-presets.ts";

test("zoom-chain navigation clamps at its ends and excludes independent tours", () => {
  assert.equal(stepView("machine", 1), "core");
  assert.equal(stepView("core", -1), "machine");
  assert.equal(stepView("machine", -1), "machine");
  assert.equal(stepView("stf", 1), "stf");
  for (const id of ["why", "parachain"] as const) {
    assert.equal(viewIndex(id), -1);
    assert.equal(stepView(id, 1), id);
    assert.equal(stepView(id, -1), id);
  }
});

test("every navigable view has exactly one camera preset", () => {
  assert.deepEqual(CAMERA_PRESETS.map((preset) => preset.id).sort(), [...VIEW_IDS].sort());
  assert.equal(new Set(VIEW_IDS).size, VIEW_IDS.length);
});
