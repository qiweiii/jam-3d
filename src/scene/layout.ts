import { Vector3 } from "three";
import { STATE_COMPONENTS } from "../content/state.ts";

/** World position of the hero core. Inner anatomy is nested here. */
export const HERO = new Vector3(1.5, 0.35, 6.5);
/** Kidney local units → world. Large enough that the block is a neighbour, not another planet. */
export const INNER = 0.12;
/** Local horizontal offset that seats the PVM lobe inside the on-chain river. */
export const PVM_SHIFT_X = 0.35;
/** This slot, lower-right of the hero core, where the report enters the vertical chain. */
export const NOW_BLOCK = new Vector3(HERO.x + 0.62, HERO.y - 0.85, HERO.z + 0.12);

/** Compact spacing keeps the descending chain inside the on-chain river. */
export const BLOCK_GAP = 0.26;

export const CHAIN_RAIL_OFFSET = 0.05;
export const STATE_DISC_RADIUS = 0.036;
export const STATE_DISC_HEIGHT = 0.006;
const STATE_DISC_GAP = 0.001;
type StateSymbol = (typeof STATE_COMPONENTS)[number]["symbol"];

/** The cylinder layers and their journey markers share the same geometry. */
export function stateComponentY(symbol: StateSymbol): number {
  const index = STATE_COMPONENTS.findIndex((component) => component.symbol === symbol);
  return ((STATE_COMPONENTS.length - 1) / 2 - index) * (STATE_DISC_HEIGHT + STATE_DISC_GAP);
}

export function stateComponentPosition(symbol: StateSymbol, blocksBack = 0): Vector3 {
  return NOW_BLOCK.clone().add(new Vector3(CHAIN_RAIL_OFFSET, stateComponentY(symbol) - blocksBack * BLOCK_GAP, 0));
}

export function nest(local: Vector3): Vector3 {
  return new Vector3(HERO.x + local.x * INNER, HERO.y + local.y * INNER, HERO.z + local.z * INNER);
}
