import { CatmullRomCurve3, Vector3 } from "three";

/** Shared world/core curve settings. Parachain report paths intentionally use their own settings. */
export function makeCurve(points: [number, number, number][]): CatmullRomCurve3 {
  return new CatmullRomCurve3(
    points.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    "catmullrom",
    0.4,
  );
}
