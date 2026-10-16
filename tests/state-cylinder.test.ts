import assert from "node:assert/strict";
import test from "node:test";
import { STATE_COMPONENTS } from "../src/content/state.ts";
import { STATE_DISC_HEIGHT, STATE_DISC_RADIUS, stateComponentY } from "../src/scene/layout.ts";
import { buildStateCylinder } from "../src/scene/state-cylinder.ts";

test("the service scene reuses the Block view's state order, colours and layer proportions", () => {
  const cylinder = buildStateCylinder();
  assert.equal(cylinder.radius, STATE_DISC_RADIUS * 20);
  for (const [index, layer] of cylinder.layers.entries()) {
    const component = STATE_COMPONENTS[index]!;
    assert.equal(layer.name, component.symbol);
    assert.equal(layer.material.emissive.getHex(), component.color);
    assert.equal(layer.position.y, stateComponentY(component.symbol) * 20);
    assert.equal(layer.position.x, 0);
    assert.equal(layer.position.z, 0);
    assert.deepEqual(layer.rotation.toArray().slice(0, 3), [0, 0, 0]);
    assert.equal(layer.geometry.parameters.height, STATE_DISC_HEIGHT * 20);
  }
});

test("pending reports and allocations target their own state layers", () => {
  const cylinder = buildStateCylinder();
  for (const symbol of ["ρ", "δ", "φ"] as const) {
    assert.equal(cylinder.point(symbol).y, cylinder.group.getObjectByName(symbol)!.position.y);
    cylinder.highlight(symbol, 1.2);
    for (const layer of cylinder.layers)
      assert.equal(layer.material.emissiveIntensity, layer.name === symbol ? 1.2 : 0.12);
  }
  assert.notEqual(cylinder.point("ρ").y, cylinder.point("φ").y);
});
