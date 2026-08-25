import { Vector3 } from "three";

export function easeQuintic(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
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
