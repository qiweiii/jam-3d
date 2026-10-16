/** Reading time after the reports are ready for accumulation, in seconds. */
export const PARACHAIN_HOLD = { afterAvailability: 3 } as const;

/** Teaching example from PR #11883, revision 8607a02, sections 2–5 and 7. */
export const PARACHAIN_STEPS = [
  {
    id: "host",
    title: "One service, many parachains",
    body: "One JAM service hosts many parachains. Above: their blocks. Below: their accepted heads, recorded by the host. Each parachain keeps its own runtime and chain state.",
    duration: 6,
  },
  {
    id: "collect",
    title: "Collators build parachain blocks",
    body: "Collators package a parachain block candidate with proof-of-validity data. This example follows three work packages, one per candidate.",
    duration: 5,
  },
  {
    id: "validate",
    title: "Validate in parallel",
    body: "Guarantors run each parachain's validation code through Refine. A work-report carries the result and proposed parachain head for later accumulation.",
    duration: 7,
  },
  {
    id: "reports",
    title: "Confirm data availability",
    body: "Signed work-reports are recorded in JAM's pending-report state. Enough availability assurances in a later JAM block release them for accumulation.",
    duration: 7 + PARACHAIN_HOLD.afterAvailability,
    hold: PARACHAIN_HOLD.afterAvailability,
  },
  {
    id: "enact",
    title: "Advance parachain heads",
    body: "Accumulate checks the candidate's code and parent parachain head before updating the host's records. The box shows the head records in this service's JAM account.",
    duration: 9,
  },
  {
    id: "assign",
    title: "Set a core's authorizer queue",
    body: "Coretime's accepted parachain block includes a core allocation. When due, the host writes that instruction to JAM's authorizer queue for the chosen core.",
    duration: 8,
  },
] as const;

export type ParachainStep = (typeof PARACHAIN_STEPS)[number];
