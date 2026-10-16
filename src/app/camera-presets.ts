import { Vector3 } from "three";
import type { CameraFrame } from "../graphics/camera-motion";
import { nest, HERO, NOW_BLOCK, BLOCK_GAP } from "../world/layout.ts";
import type { ViewId } from "./view-catalog";

const CORE_POSITION = nest(new Vector3(-2.4, 1.5, 15.2));
const CORE_TARGET = nest(new Vector3(2.1, 0.2, 0));
const CORE_VIEW_OFFSET = CORE_POSITION.clone().sub(CORE_TARGET);
const PACKAGE_TARGET = new Vector3(HERO.x + 0.35, HERO.y - 0.4, HERO.z + 0.1);
const PACKAGE_POSITION = PACKAGE_TARGET.clone().addScaledVector(CORE_VIEW_OFFSET, 1.4);
const BLOCK_TARGET = new Vector3(NOW_BLOCK.x, NOW_BLOCK.y, NOW_BLOCK.z);
const BLOCK_POSITION = BLOCK_TARGET.clone().add(new Vector3(0, 0, 0.5));
const STF_TARGET = new Vector3(NOW_BLOCK.x, NOW_BLOCK.y - BLOCK_GAP / 2, NOW_BLOCK.z);
const STF_POSITION = STF_TARGET.clone().add(new Vector3(0, 0, 0.38));

export type CameraPreset = CameraFrame & {
  id: ViewId;
  label: string;
};

export const CAMERA_PRESETS: CameraPreset[] = [
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
  {
    id: "why",
    label: "why",
    position: new Vector3(46, 1.18, 4.3),
    target: new Vector3(46, 0.32, 0),
    minDist: 1.2,
    maxDist: 34,
  },
  {
    id: "parachain",
    label: "parachain service",
    position: new Vector3(-46, 0.35, 14),
    target: new Vector3(-46, 0.35, 0),
    minDist: 9,
    maxDist: 26,
  },
];

/** Exhibit-specific fit policy stays in app configuration, not in the renderer. */
const FRAMING_ASPECT: Record<ViewId, number> = {
  machine: 1.15,
  core: 1.25,
  package: 1.35,
  block: 1.2,
  stf: 0.8,
  why: 1.1,
  parachain: 0.9,
};

export function cameraScale(id: ViewId, width: number, height: number): number {
  if (width <= 0 || height <= 0) return 1;
  const desktopZoom = id === "stf" && width >= 1024 ? 0.9 : 1;
  return Math.max(1, (FRAMING_ASPECT[id] * height) / width) * desktopZoom;
}

/** Preserve the viewing angle and scale dolly limits with the fitted distance. */
export function frameForViewport(frame: CameraPreset, width: number, height: number): CameraPreset {
  const scale = cameraScale(frame.id, width, height);
  return {
    ...frame,
    position: frame.target.clone().lerp(frame.position, scale),
    target: frame.target.clone(),
    minDist: frame.minDist * scale,
    maxDist: frame.maxDist * scale,
  };
}
