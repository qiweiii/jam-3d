export type StationKind = "overview" | "author" | "incore" | "da" | "onchain";

export type Station = {
  id: string;
  title: string;
  kicker: string;
  kind: StationKind;
  /** Section / appendix name. Draft number is attached at zoom time, not frozen in copy. */
  gp: string;
  /** Equation / definition ids when we zoom in, e.g. (4.3). */
  eq?: string;
  /** KaTeX later; keep source of truth next to the station. */
  tex?: string;
  body: string;
};

/** Copy is Gray Paper first. Keep it short enough to say aloud. */
export const stations: Station[] = [
  {
    id: "overview",
    title: "Join-Accumulate Machine",
    kicker: "overview",
    kind: "overview",
    gp: "Gray Paper · §1–2",
    body: "A JAM node is a shared computer: many cores do heavy work in parallel, then one chain accumulates the small results. Parachains become one service among others.",
  },
  {
    id: "safrole",
    title: "Who authors this block",
    kicker: "SAFROLE",
    kind: "author",
    gp: "Gray Paper · SAFROLE",
    eq: "γA, γS",
    body: "Validators submit tickets this epoch (γA). They sort by ticket-id. Next epoch those tickets become γS: one author per slot, known to that author. If the accumulator is not full, fallback.",
  },
  {
    id: "work-package",
    title: "Work package",
    kicker: "out of core",
    kind: "incore",
    gp: "Gray Paper · work packages",
    body: "A work package is a bundle of work-items for one core. Items may belong to different services. This is the unit that refine will digest; it is not yet chain state.",
  },
  {
    id: "authorized",
    title: "is-authorized",
    kicker: "in-core PVM",
    kind: "incore",
    gp: "Gray Paper · authorization",
    body: "Before refine, the core asks: may this package run here, this slot? That is a PVM invocation. No means the package is dropped. Yes does not commit service storage.",
  },
  {
    id: "refine",
    title: "Refine",
    kicker: "in-core PVM",
    kind: "incore",
    gp: "Gray Paper · refine",
    body: "Heavy, parallel work. Refine turns items into a work-report: digests and a small result. It does not write the service account. That wait is accumulate.",
  },
  {
    id: "da",
    title: "Availability",
    kicker: "erasure coding",
    kind: "da",
    gp: "Gray Paper · availability · app. EC",
    body: "The blob that backs a report is erasure-coded. Reconstruct from k of n pieces. Validators do not each store the full package. No availability, no accumulate.",
  },
  {
    id: "guarantee",
    title: "Guarantee",
    kicker: "on-chain extrinsic",
    kind: "onchain",
    gp: "Gray Paper · guaranteeing",
    body: "Guarantors put the work-report on-chain. The block now claims: this core produced this report. The report is a commitment.",
  },
  {
    id: "assurance",
    title: "Assurance",
    kicker: "on-chain",
    kind: "onchain",
    gp: "Gray Paper · reporting and assurance",
    body: "Validators sign availability bits. The STF records who attested that the pieces exist. Accumulate only consumes reports that are available.",
  },
  {
    id: "accumulate",
    title: "Accumulate",
    kicker: "on-chain PVM",
    kind: "onchain",
    gp: "Gray Paper · accumulation",
    body: "Ready reports run in spec order. Accumulate is the cheap on-chain fold: update service code, balance, storage. This is the Join-Accumulate step that mutates the chain.",
  },
  {
    id: "on-transfer",
    title: "On-transfer",
    kicker: "on-chain PVM",
    kind: "onchain",
    gp: "Gray Paper · on-transfer",
    body: "After accumulate, deferred transfers invoke the destination service. Another PVM entry. Cross-service signalling is this, not refine talking to another service’s storage.",
  },
  {
    id: "state-root",
    title: "State root",
    kicker: "merklization",
    kind: "onchain",
    gp: "Gray Paper · app. merklization",
    body: "The header commits to a state root. The trie holds keyed state items. The DA blob is not in the trie. If merklization is wrong, the root is wrong.",
  },
];
