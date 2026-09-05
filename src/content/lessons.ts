import { gp } from "./references";


/** Independent reading layer: no camera positions or scene mutations. */
export const LESSONS = [
  {
    title: "One shared machine",
    body: "JAM combines parallel computation with shared on-chain state. Services provide the code for both refinement and accumulation.",
    source: gp(),
  },
  {
    title: "Services supply the work",
    body: "A work-package contains work-items for services. Authorization checks whether the package may use a core.",
    source: gp(),
  },
  {
    title: "Refine has two outputs",
    body: "Work results and can export data segments. Results become work-digests, which fill the work-report; exported segments go to the data lake.",
    source: gp(),
  },
  {
    title: "Availability and validity",
    body: "Guarantors sign reports. Assurers attest to data availability. Auditors recheck work; disputes handle contested validity.",
    source: gp(),
  },
  {
    title: "Accumulate changes state",
    body: "Available reports must also satisfy dependencies and fit the accumulation budget. Accumulation runs service code on-chain to update state.",
    source: gp(),
  },
  {
    title: "A block transforms state",
    body: "The state transition takes prior state and a block to produce posterior state. The 17 state components are data, not execution stages.",
    source: gp(),
  },
] as const;
