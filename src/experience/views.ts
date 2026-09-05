import { Vector3 } from "three";
import { nest, HERO, NOW_BLOCK, BLOCK_GAP } from "../scene/layout";

export const LODS = ["machine", "core", "package", "block", "stf"] as const;
export type LodId = (typeof LODS)[number];

export const HOME_LOD: LodId = "machine";

const CORE_POSITION = nest(new Vector3(-2.4, 1.5, 15.2));
const CORE_TARGET = nest(new Vector3(2.1, 0.2, 0));
const CORE_VIEW_OFFSET = CORE_POSITION.clone().sub(CORE_TARGET);
const PACKAGE_TARGET = new Vector3(HERO.x + 0.35, HERO.y - 0.4, HERO.z + 0.1);
const PACKAGE_POSITION = PACKAGE_TARGET.clone().addScaledVector(CORE_VIEW_OFFSET, 1.4);
const BLOCK_TARGET = new Vector3(NOW_BLOCK.x, NOW_BLOCK.y, NOW_BLOCK.z);
const BLOCK_POSITION = BLOCK_TARGET.clone().add(new Vector3(0, 0, 0.5));
const STF_TARGET = new Vector3(NOW_BLOCK.x, NOW_BLOCK.y - BLOCK_GAP / 2, NOW_BLOCK.z);
const STF_POSITION = STF_TARGET.clone().add(new Vector3(0, 0, 0.5));

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
    position: CORE_POSITION.clone(),
    target: CORE_TARGET.clone(),
    minDist: 0.9,
    maxDist: 7,
  },
  {
    id: "package",
    label: "package",
    position: PACKAGE_POSITION.clone(),
    target: PACKAGE_TARGET.clone(),
    minDist: 1,
    maxDist: 8,
  },
  {
    id: "block",
    label: "block",
    position: BLOCK_POSITION.clone(),
    target: BLOCK_TARGET.clone(),
    minDist: 0.3,
    maxDist: 2.5,
  },
  {
    id: "stf",
    label: "stf",
    position: STF_POSITION.clone(),
    target: STF_TARGET.clone(),
    minDist: 0.07,
    maxDist: 0.8,
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
