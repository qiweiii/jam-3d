import type { Term } from "./references";

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

const DESIGN =
  "https://github.com/paritytech/polkadot-sdk/blob/8607a028f8b55b9e4d43aa45c074a98f06233547/designs/parachain-service-on-jam/parachain-service-on-jam.md";

/** Optional depth for Gray Paper readers; structs and API names stay out of the main visual. */
export const PARACHAIN_TERMS = {
  host: {
    underline: false,
    width: "22rem",
    bullets: [
      { text: "These head records live in the Parachain Service's JAM account." },
      { text: "The service also stores validation-code references and host-management records." },
      { text: "JAM's service-accounts state, δ, contains all service accounts, including this one." },
      {
        text: "A parachain head identifies its parachain's accepted tip. Full application state remains with that parachain.",
      },
      {
        text: "A JAM block can record host updates for several parachains.",
      },
      { text: "Parachain Service Design · §3", href: `${DESIGN}#3-the-parachain-service` },
    ],
  },
  refine: {
    underline: false,
    width: "22rem",
    bullets: [
      {
        text: "After package authorization, Refine loads code at the lookup anchor into a child PVM, per work item.",
      },
      { text: "This performs the candidate validation that backing validators carry out in today's Polkadot." },
      {
        text: "Refine reports a proposed parachain head, its parent's hash and upward messages; host storage stays unchanged.",
      },
      { text: "The three cores illustrate concurrent work, not a permanent one-core-per-parachain allocation." },
      { text: "Parachain Service Design · §4", href: `${DESIGN}#4-refine-in-core-execution` },
    ],
  },
  availability: {
    underline: false,
    width: "22rem",
    bullets: [
      {
        text: "Report inclusion in a JAM block installs pending availability. Assurances in a later JAM block can release it.",
      },
      {
        text: "The report waits until its dependencies are ready and there is enough accumulation gas to process it.",
      },
      { text: "Auditing is JAM's independent correctness check, separate from data-availability assurances." },
      { text: "Parachain Service Design · §§1–2", href: `${DESIGN}#1-overview` },
    ],
  },
  accumulate: {
    underline: false,
    width: "22rem",
    bullets: [
      {
        text: "The host budgets each report, then checks registration, the active code and the accepted parent parachain head.",
      },
      { text: "A stale parachain parent or wrong code rejects the candidate without updating the parachain head." },
      {
        text: "The host updates an accepted parachain head before processing its upward messages, whose effects have their own checks.",
      },
      { text: "Parachain Service Design · §5.1", href: `${DESIGN}#51-what-accumulate-does` },
    ],
  },
  coretime: {
    underline: false,
    width: "22rem",
    bullets: [
      {
        text: "Coretime's parachain work carries AssignCore; the host forwards JAM's assign call when due.",
      },
      { text: "Scheduled updates can run through always-accumulate even without a newly available candidate." },
      {
        text: "Each JAM block adds one queued authorizer to the core's pool. The timeslot selects which of the 80 entries to use.",
      },
      { text: "Parachain Service Design · §7", href: `${DESIGN}#7-authorization--coretime` },
    ],
  },
} satisfies Record<string, Term>;
