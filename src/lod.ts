import { Vector3 } from "three";

export const LODS = ["machine", "core", "package", "block", "stf"] as const;
export type LodId = (typeof LODS)[number];

export const HOME_LOD: LodId = "machine";

/** World position of the hero core. Inner anatomy is nested here. */
export const HERO = new Vector3(1.5, 0.35, 6.5);
/** Kidney local units → world. Large enough that the block is a neighbour, not another planet. */
export const INNER = 0.12;
/** This slot, just outside the hero core (refine output). */
export const NOW_BLOCK = new Vector3(HERO.x + 3.1, HERO.y - 3.2, HERO.z + 0.5);

/** Spacing between chain blocks; the STF stack sits in the gap this leaves. */
export const BLOCK_GAP = 1.9;

export function nest(local: Vector3): Vector3 {
  return new Vector3(
    HERO.x + local.x * INNER,
    HERO.y + local.y * INNER,
    HERO.z + local.z * INNER,
  );
}

export type LodFrame = {
  id: LodId;
  label: string;
  position: Vector3;
  target: Vector3;
  minDist: number;
  maxDist: number;
};

export const frames: LodFrame[] = [
  {
    id: "machine",
    label: "machine",
    position: new Vector3(1, 2.2, 56),
    target: new Vector3(1, -0.2, 0.4),
    minDist: 32,
    maxDist: 96,
  },
  {
    id: "core",
    label: "core",
    position: nest(new Vector3(-1.2, 1.8, 13.5)),
    target: nest(new Vector3(0.6, 0.15, 0)),
    minDist: 0.9,
    maxDist: 7,
  },
  {
    id: "package",
    label: "package",
    position: new Vector3(HERO.x - 5.2, HERO.y + 2.6, HERO.z + 7.4),
    target: new Vector3(HERO.x + 1.1, HERO.y - 1.0, HERO.z + 0.2),
    minDist: 2.2,
    maxDist: 16,
  },
  {
    id: "block",
    label: "block",
    position: new Vector3(NOW_BLOCK.x + 4.4, NOW_BLOCK.y + 2.8, NOW_BLOCK.z + 5.6),
    target: NOW_BLOCK.clone(),
    minDist: 2.4,
    maxDist: 16,
  },
  {
    id: "stf",
    label: "stf",
    position: new Vector3(NOW_BLOCK.x + 2.4, NOW_BLOCK.y + 1.6, NOW_BLOCK.z - BLOCK_GAP / 2 + 0.9),
    target: new Vector3(NOW_BLOCK.x, NOW_BLOCK.y, NOW_BLOCK.z - BLOCK_GAP / 2),
    minDist: 1,
    maxDist: 7,
  },
];

export function lodIndex(id: LodId): number {
  return LODS.indexOf(id);
}

export function stepLod(id: LodId, delta: number): LodId {
  const i = Math.max(0, Math.min(LODS.length - 1, lodIndex(id) + delta));
  const next = LODS[i];
  return next ?? id;
}
