import { CatmullRomCurve3, Vector3 } from "three";

export const PARACHAIN_HEAD = { y: -2.3, depth: 0.25 } as const;

/** All head records share one level and depth plane. */
export function parachainHeadPosition(headX: number) {
  return new Vector3(headX, PARACHAIN_HEAD.y, 0);
}

/** One report keeps its identity from signing through availability to its host-record update. */
export function parachainReportPaths(index: number, headX: number, pendingPoint: Vector3) {
  const curve = (points: number[][]) => new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
  const outputPoint = new Vector3(headX - 0.65, 1.35, 0.55);
  const outputPath = curve([[headX, 1.55, 0.45], [headX - 0.3, 1.38, 0.6], outputPoint.toArray()]);
  const readyPoint = new Vector3(-2.6 + index * 0.65, -0.15, 0.45);
  const pendingSlot = pendingPoint.clone();
  pendingSlot.x += (index - 1) * 0.24;
  const reportPath = curve([
    outputPoint.toArray(),
    [(outputPoint.x + pendingSlot.x) / 2, (outputPoint.y + pendingSlot.y) / 2 + 0.15, 0.95],
    pendingSlot.toArray(),
  ]);
  const releasePath = curve([pendingSlot.toArray(), [2, 0.25, 0.9], [0.2, -0.05, 0.8], readyPoint.toArray()]);
  // Descend to the matching head; only the middle lane needs a small clearance around the title.
  const entryX = index === 1 ? -1.7 : headX;
  const accumulatePath = curve([
    readyPoint.toArray(),
    [entryX, -0.85, 0.65],
    [entryX, index === 1 ? -1.98 : -1.8, 0.65],
    parachainHeadPosition(headX).toArray(),
  ]);
  return { outputPath, reportPath, releasePath, accumulatePath };
}
