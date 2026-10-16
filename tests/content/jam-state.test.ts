import assert from "node:assert/strict";
import test from "node:test";
import { JAM_STATE_COMPONENTS } from "../../src/content/jam-state.ts";

test("state inventory matches Gray Paper 0.8.0 §4.2, independently of STF operations", () => {
  assert.deepEqual(
    JAM_STATE_COMPONENTS.map((component) => component.symbol),
    ["α", "β", "θ", "γ", "δ", "η", "ι", "κ", "λ", "ρ", "τ", "φ", "χ", "ψ", "π", "ω", "ξ"],
  );
});
