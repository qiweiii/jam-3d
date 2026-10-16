import assert from "node:assert/strict";
import test from "node:test";
import { parseRoute, routeHash } from "../../src/app/routes.ts";

test("view paths parse and unknown views fall back to machine", () => {
  assert.deepEqual(parseRoute("#/why"), { view: "why", step: null });
  assert.deepEqual(parseRoute("#/stf"), { view: "stf", step: null });
  assert.deepEqual(parseRoute("#/parachain?step=4"), { view: "parachain", step: 4 });
  assert.deepEqual(parseRoute(""), { view: "machine", step: null });
  assert.deepEqual(parseRoute("#/nonsense?step=2"), { view: "machine", step: 2 });
});

test("step query is 1-based and floors at one", () => {
  assert.deepEqual(parseRoute("#/why?step=3"), { view: "why", step: 3 });
  assert.deepEqual(parseRoute("#/package?step=0"), { view: "package", step: 1 });
  assert.deepEqual(parseRoute("#/why?other=1&step=5"), { view: "why", step: 5 });
});

test("route hashes round-trip through the parser", () => {
  assert.equal(routeHash("why", 3), "#/why?step=3");
  assert.equal(routeHash("machine"), "#/machine");
  assert.deepEqual(parseRoute(routeHash("package", 4)), { view: "package", step: 4 });
  assert.deepEqual(parseRoute(routeHash("parachain", 6)), { view: "parachain", step: 6 });
});
