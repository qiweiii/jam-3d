/** Stage identifiers, dependency-free so tests and the router can share them. */
export const LODS = ["machine", "core", "package", "block", "stf"] as const;

/** Zoom chain plus `why`, the off-axis rationale stage. */
export type LodId = (typeof LODS)[number] | "why";

export const HOME_LOD: LodId = "machine";
