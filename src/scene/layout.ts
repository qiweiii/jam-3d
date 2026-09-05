import { Vector3 } from "three";

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

export function nest(local: Vector3): Vector3 {
  return new Vector3(HERO.x + local.x * INNER, HERO.y + local.y * INNER, HERO.z + local.z * INNER);
}
