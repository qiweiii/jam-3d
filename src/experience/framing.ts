import type { LodId } from "./stages.ts";
import type { LodFrame } from "./views.ts";

/** Minimum horizontal room for each scene before portrait framing pulls back. */
const FRAMING_ASPECT: Record<LodId, number> = {
  machine: 1.15,
  core: 1.25,
  package: 1.35,
  block: 1.2,
  stf: 0.8,
  why: 1.1,
};

export function cameraScale(id: LodId, width: number, height: number): number {
  if (width <= 0 || height <= 0) return 1;
  const desktopZoom = id === "stf" && width >= 1024 ? 0.9 : 1;
  return Math.max(1, (FRAMING_ASPECT[id] * height) / width) * desktopZoom;
}

/** Preserve the viewing angle and scale dolly limits with the fitted distance. */
export function frameForViewport(frame: LodFrame, width: number, height: number): LodFrame {
  const scale = cameraScale(frame.id, width, height);
  return {
    ...frame,
    position: frame.target.clone().lerp(frame.position, scale),
    target: frame.target.clone(),
    minDist: frame.minDist * scale,
    maxDist: frame.maxDist * scale,
  };
}
