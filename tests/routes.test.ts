import assert from "node:assert/strict";
import test from "node:test";
import { parseRoute, routeHash } from "../src/experience/routes.ts";

test("stage paths parse and unknown stages fall back to machine", () => {
  assert.deepEqual(parseRoute("#/why"), { lod: "why", step: null });
  assert.deepEqual(parseRoute("#/stf"), { lod: "stf", step: null });
  assert.deepEqual(parseRoute("#/parachain?step=4"), { lod: "parachain", step: 4 });
  assert.deepEqual(parseRoute(""), { lod: "machine", step: null });
  assert.deepEqual(parseRoute("#/nonsense?step=2"), { lod: "machine", step: 2 });
});

test("step query is 1-based and floors at one", () => {
  assert.deepEqual(parseRoute("#/why?step=3"), { lod: "why", step: 3 });
  assert.deepEqual(parseRoute("#/package?step=0"), { lod: "package", step: 1 });
  assert.deepEqual(parseRoute("#/why?other=1&step=5"), { lod: "why", step: 5 });
});

test("route hashes round-trip through the parser", () => {
  assert.equal(routeHash("why", 3), "#/why?step=3");
  assert.equal(routeHash("machine"), "#/machine");
  assert.deepEqual(parseRoute(routeHash("package", 4)), { lod: "package", step: 4 });
  assert.deepEqual(parseRoute(routeHash("parachain", 6)), { lod: "parachain", step: 6 });
});
