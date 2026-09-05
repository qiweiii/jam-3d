import { HOME_LOD, LODS, type LodId } from "./stages.ts";
export type Route = {
  lod: LodId;
  /** 1-based step index for staged views (why, package); null when absent. */
  step: number | null;
};

const KNOWN: readonly string[] = [...LODS, "why"];

/** `#/why?step=3` → { lod: "why", step: 3 }; unknown stages fall back to the home view. */
export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#\/?/, "");
  const [stagePart, queryPart] = raw.split("?");
  const stage = stagePart || HOME_LOD;
  const lod = (KNOWN.includes(stage) ? stage : HOME_LOD) as LodId;
  let step: number | null = null;
  if (queryPart) {
    const match = /(?:^|&)step=(\d+)/.exec(queryPart);
    if (match) step = Math.max(1, Number.parseInt(match[1]!, 10));
  }
  return { lod, step };
}

export function routeHash(lod: LodId, step: number | null = null): string {
  return `#/${lod}${step ? `?step=${step}` : ""}`;
}
