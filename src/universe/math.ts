import { Vector3 } from "three";


/** Fast start, gentle landing, for camera flights that should feel immediate. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function slerpDir(a: Vector3, b: Vector3, t: number, out: Vector3): Vector3 {
  const dot = Math.min(1, Math.max(-1, a.dot(b)));
  const theta = Math.acos(dot);
  if (theta < 1e-4) return out.copy(b);
  const s = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / s;
  const wb = Math.sin(t * theta) / s;
  return out.copy(a).multiplyScalar(wa).addScaledVector(b, wb);
}
