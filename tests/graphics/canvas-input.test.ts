import assert from "node:assert/strict";
import test from "node:test";
import { wheelDollyAmount } from "../../src/graphics/canvas-input.ts";

test("pinch wheel input is inverted for camera dolly and never falls through to page zoom", () => {
  assert.equal(wheelDollyAmount(100, 0, 720, true), -0.26);
  assert.equal(wheelDollyAmount(-100, 0, 720, true), 0.26);
  assert.equal(wheelDollyAmount(1, 1, 720, false), 0.0416);
  assert.equal(wheelDollyAmount(0, 0, 720, true), 0);
});
