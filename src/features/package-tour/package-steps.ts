/** Presentation speed multipliers: higher is faster. Base durations below are seconds. */
export const PACKAGE_SPEED = {
  inCore: 1.25,
  onChain: 0.8,
} as const;

/** Reading time in seconds, added after the report-inclusion animation. */
export const PACKAGE_HOLD = { afterReport: 1 } as const;

/** One successful journey across blocks, not a slot schedule or a protocol simulation. */
export const PACKAGE_STEPS = [
  {
    id: "package",
    title: "Work package",
    body: "A package brings work-items and references to their input data.",
    duration: 3 / PACKAGE_SPEED.inCore,
    report: false,
  },
  {
    id: "authorize",
    title: "Authorize",
    body: "Guarantors run the authorizer before refining the package.",
    duration: 3 / PACKAGE_SPEED.inCore,
    report: false,
  },
  {
    id: "refine",
    title: "Refine",
    body: "Service code produces results and may export segments to the data lake.",
    duration: 4 / PACKAGE_SPEED.inCore,
    report: false,
  },
  {
    id: "guarantee",
    title: "Sign & report",
    body: "Guarantors sign the work-report. A block author includes it on-chain, where it waits for availability.",
    duration: 6 / PACKAGE_SPEED.onChain + PACKAGE_HOLD.afterReport,
    hold: PACKAGE_HOLD.afterReport,
    report: true,
  },
  {
    id: "availability",
    title: "Await availability",
    body: "Validators attest that they hold their data shards. A later block includes enough assurances to make the report available.",
    duration: 6 / PACKAGE_SPEED.onChain,
    report: true,
  },
  {
    id: "accumulate",
    title: "Accumulate",
    body: "With dependencies satisfied and budget available, accumulation applies the results to service state in this later block.",
    duration: 5 / PACKAGE_SPEED.onChain,
    report: true,
  },
] as const;

export type PackageStep = (typeof PACKAGE_STEPS)[number];
