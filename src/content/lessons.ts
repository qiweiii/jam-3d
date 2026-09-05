const paper = "https://github.com/gavofyork/graypaper/blob/v0.8.0/text/";

/** Independent reading layer: no camera positions or scene mutations. */
export const LESSONS = [
  {
    title: "One shared machine",
    body: "JAM combines parallel computation with shared on-chain state. Services provide the code for both refinement and accumulation.",
    source: `${paper}overview.tex`,
  },
  {
    title: "Services supply the work",
    body: "A work-package contains work-items for services. Authorization checks whether the package may use a core.",
    source: `${paper}work_packages_and_reports.tex`,
  },
  {
    title: "Refine has two outputs",
    body: "Refinement produces work results and can export data segments. Results go in a work-report; exported segments go to the data lake.",
    source: `${paper}work_packages_and_reports.tex`,
  },
  {
    title: "Availability and validity",
    body: "Guarantors sign reports. Assurers attest to data availability. Auditors recheck work; disputes handle contested validity.",
    source: `${paper}overview.tex`,
  },
  {
    title: "Accumulate changes state",
    body: "Available reports must also satisfy dependencies and fit the accumulation budget. Accumulation runs service code on-chain to update state.",
    source: `${paper}accumulation.tex`,
  },
  {
    title: "A block transforms state",
    body: "The state transition takes prior state and a block to produce posterior state. The 17 state components are data, not execution stages.",
    source: `${paper}overview.tex#L30-L67`,
  },
] as const;
