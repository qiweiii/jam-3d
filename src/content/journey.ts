/** A successful example, not a slot schedule or a complete protocol simulation. */
export const JOURNEY_STEPS = [
  {
    id: "package",
    title: "Work package",
    body: "A package brings work-items and references to their input data.",
    duration: 3,
    report: false,
  },
  {
    id: "authorize",
    title: "Authorize",
    body: "Guarantors run the authorizer before refining the package.",
    duration: 3,
    report: false,
  },
  {
    id: "refine",
    title: "Refine",
    body: "Service code produces results and may export segments to the data lake.",
    duration: 4,
    report: false,
  },
  {
    id: "guarantee",
    title: "Guarantee",
    body: "Signed guarantees bring the work-report on-chain. Service state has not yet been updated by this work.",
    duration: 4,
    report: true,
  },
  {
    id: "availability",
    title: "Await availability",
    body: "The report stays pending until enough validators attest to the data’s availability.",
    duration: 4,
    report: true,
  },
  {
    id: "accumulate",
    title: "Accumulate",
    body: "With dependencies satisfied and budget available, accumulation applies the work to service state.",
    duration: 4,
    report: true,
  },
] as const;
