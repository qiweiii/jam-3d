import assert from "node:assert/strict";
import test from "node:test";
import { STATE_COMPONENTS } from "../src/content/state.ts";
import {
  BLOCK_GAP,
  CHAIN_RAIL_OFFSET,
  NOW_BLOCK,
  stateComponentPosition,
  stateComponentY,
} from "../src/scene/layout.ts";

test("pending and service markers use their actual state-cylinder layers", () => {
  const pending = stateComponentPosition("ρ");
  const service = stateComponentPosition("δ");
  assert.equal(pending.x, NOW_BLOCK.x + CHAIN_RAIL_OFFSET);
  assert.equal(pending.y, NOW_BLOCK.y + stateComponentY("ρ"));
  assert.equal(pending.z, NOW_BLOCK.z);
  assert.ok(service.y > pending.y);
  assert.equal(
    new Set(STATE_COMPONENTS.map((component) => stateComponentY(component.symbol))).size,
    STATE_COMPONENTS.length,
  );
});

test("the recorded pending marker follows block N into history without moving the service-state target", () => {
  const initial = stateComponentPosition("ρ");
  const previous = stateComponentPosition("ρ", 1);
  assert.equal(previous.x, initial.x);
  assert.equal(previous.y, initial.y - BLOCK_GAP);
  assert.equal(previous.z, initial.z);
  assert.equal(stateComponentPosition("δ").y, NOW_BLOCK.y + stateComponentY("δ"));
  assert.equal(stateComponentPosition("ρ").y, initial.y);
});
