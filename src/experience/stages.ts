/** Stage identifiers, dependency-free so tests and the router can share them. */
export const LODS = ["machine", "core", "package", "block", "stf"] as const;

/** The zoom chain plus independently entered rationale and service scenes. */
export type LodId = (typeof LODS)[number] | "why" | "parachain";

export const HOME_LOD: LodId = "machine";
