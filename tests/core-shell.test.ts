import assert from "node:assert/strict";
import test from "node:test";
import { createCoreShell } from "../src/scene/core-shell.ts";

test("the shared core cutaway changes coverage without alpha seams or recompiling", () => {
  const shell = createCoreShell({ color: 0x0c1a22 });
  const version = shell.material.version;
  assert.equal(shell.material.opacity, 1);
  assert.equal(shell.material.alphaToCoverage, true);
  assert.equal(shell.material.transparent, false);
  assert.equal(shell.material.depthWrite, true);
  shell.setCutaway(true);
  assert.equal(shell.material.opacity, 0.35);
  assert.equal(shell.material.version, version);
  shell.setCutaway(false);
  assert.equal(shell.material.opacity, 1);
  shell.material.dispose();
});
