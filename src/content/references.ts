/** Gray Paper reader + secondary notes. Default draft is 0.8.0. */

export const GP_DRAFT = "0.8.0";
/** First 7 chars of the 0.8.0 paper hash on Fluffy Labs. */
export const GP_VER = "07f041d";
export const GP_READER = "https://graypaper.fluffylabs.dev";
export const KIAN_JAM = "https://blog.kianenigma.com/posts/tech/demystifying-jam/";

/**
 * Fluffy Labs reader, draft 0.8.0.
 * Pass `selection` copied from the reader hash after highlighting text
 * (`<start><end>`, 12 hex chars). Do not invent page indexes; a zero-width
 * caret does not restore a selection.
 * `#/07f041d/<selection>?v=0.8.0` or `#/07f041d?v=0.8.0`.
 */
export function gp(selection = "", draft = GP_DRAFT): string {
  const sel = selection.replace(/[#/]/g, "");
  const q = `v=${draft}`;
  return sel ? `${GP_READER}/#/${GP_VER}/${sel}?${q}` : `${GP_READER}/#/${GP_VER}?${q}`;
}

export function kian(headingId: string): string {
  const id = headingId.replace(/^#/, "");
  return `${KIAN_JAM}#${id}`;
}

export type TermBullet = {
  text: string;
  href?: string;
};

export type Term = {
  bullets: TermBullet[];
  side?: "top" | "bottom" | "left" | "right";
  width?: string;
  /** Dotted underline. Default true. Jam title skips it. */
  underline?: boolean;
};

export const TERMS = {
  jam: {
    side: "bottom",
    width: "22rem",
    underline: false,
    bullets: [
      {
        text: "Join-Accumulate Machine: a mostly-coherent trustless supercomputer.",
      },
      {
        text: "Gray Paper · JOIN-ACCUMULATE MACHINE",
        href: "https://graypaper.com/",
      },
    ],
  },
  da: {
    side: "bottom",
    width: "24rem",
    bullets: [
      {
        text: "Two stores: the short-term Audit DA holds the erasure-coded work bundle; the long-term D³L holds exported segments with their proofs.",
      },
      {
        text: "Short-term: the audit bundle (package, extrinsics, imported segments, proofs) is kept only until the block making its report available is finalized.",
      },
      {
        text: "Long-term: the D³L keeps exported segments at least 28 days = 672 epochs, ready for future work-packages to import in refine.",
      },
      {
        text: "Guarantors erasure-code both sets and give one chunk to each validator; any 342 of the 1023 pieces rebuild the data.",
      },
      {
        text: "Aggregate availability ≈ 682 MB/s; ≈ 2 PB retained network-wide, at most ≈ 6 TB per node.",
      },
      {
        text: "A greater-than-two-thirds majority of assurance bits makes the report available to accumulate; without it the assignment is dropped after U = 5 slots.",
      },
      {
        text: "Gray Paper 0.8.0 · §11 reporting and assurance",
        href: gp(),
      },
      {
        text: "Gray Paper 0.8.0 · §14 D³L",
        href: gp(),
      },
      {
        text: "Gray Paper 0.8.0 · §20 performance",
        href: gp(),
      },
      {
        text: "Demystifying JAM · in-core vs on-chain vs DA",
        href: kian("inside-core-vs-on-the-chain"),
      },
      {
        text: "Demystifying JAM · data sharding",
        href: kian("appendix-data-sharding"),
      },
    ],
  },
  preimage: {
    side: "bottom",
    width: "17rem",
    bullets: [
      {
        text: "A preimage is the original blob behind a hash H(blob).",
      },
      {
        text: "Services keep blobs in their service account δ and fetch them by hash, on-chain.",
      },
      {
        text: "Gray Paper 0.8.0 · §9 preimage lookups",
        href: gp(),
      },
    ],
  },
  upload: {
    side: "bottom",
    width: "17rem",
    bullets: [
      {
        text: "Preimages enter on-chain through the preimages extrinsic E_P, addressed to a service.",
      },
      {
        text: "Gray Paper 0.8.0 · §4.1 the block",
        href: gp(),
      },
    ],
  },
  store: {
    side: "bottom",
    width: "18rem",
    bullets: [
      {
        text: "Held per service on-chain: blobs keyed by their hash, availability tracked since when.",
      },
      {
        text: "Unreferenced blobs may be expunged after D = 19,200 timeslots ≈ 32 hours.",
      },
      {
        text: "Gray Paper 0.8.0 · §9 service state",
        href: gp(),
      },
    ],
  },
  past: {
    side: "bottom",
    width: "16rem",
    bullets: [
      {
        text: "Earlier work built on: imported segments fetched from the D³L, by root and index.",
      },
    ],
  },
  new: {
    side: "bottom",
    width: "16rem",
    bullets: [
      {
        text: "The fresh package's whole bundle fits within W_B ≈ 13.8 MB: payloads, extrinsics, imports, auth data.",
      },
      {
        text: "Gray Paper 0.8.0 · §14 work packages and reports",
        href: gp(),
      },
    ],
  },
  future: {
    side: "bottom",
    width: "16rem",
    bullets: [
      {
        text: "Exported segments go to the D³L for later work-packages to import. This is separate from the small work-report sent on-chain.",
      },
      {
        text: "Gray Paper 0.8.0 · §14.2 segments",
        href: "https://github.com/gavofyork/graypaper/blob/v0.8.0/text/work_packages_and_reports.tex#L37-L47",
      },
    ],
  },
  pvm: {
    side: "bottom",
    width: "18rem",
    bullets: [
      {
        text: "In-core PVM: authorize + refine on this core.",
      },
      {
        text: "Accumulate is on-chain, a different entry point, with service state.",
      },
      {
        text: "Virtual hardware: 25–50% of a native core, 2 GB of RAM, 2 MB/s of i/o, 6-second segments.",
      },
    ],
  },
  refine: {
    side: "bottom",
    width: "16rem",
    bullets: [
      {
        text: "In-core: heavy work → a work-report. Does not write the service account.",
      },
    ],
  },
  stateAccess: {
    side: "bottom",
    width: "17rem",
    bullets: [
      {
        text: "Accumulation runs on-chain with access to service state.",
      },
      {
        text: "It can read and update state.",
      },
      {
        text: "Gray Paper 0.8.0 · §4.9 in-core and on-chain",
        href: gp(),
      },
    ],
  },
  state: {
    side: "left",
    width: "18rem",
    bullets: [
      {
        text: "Everything JAM tracks at one block: services δ, validators κ, Safrole γ, per-core reports ρ, recent history β, slot τ.",
      },
      {
        text: "17 logical state components. A transition can update several components; several transitions can contribute to one component.",
      },
      {
        text: "Blocks commit only its 32-octet root H_R = M_σ(σ).",
      },
      {
        text: "Gray Paper 0.8.0 · §4.2 the state",
        href: gp(),
      },
      {
        text: "Gray Paper 0.8.0 · §5 the header",
        href: gp(),
      },
    ],
  },
  statePost: {
    side: "left",
    width: "17rem",
    bullets: [
      {
        text: "σ′ = Υ(σ, B): the state after this block's transition.",
      },
      {
        text: "The next block's header commits root(σ′), so Merklization pipelines into block production.",
      },
      {
        text: "Gray Paper 0.8.0 · §4 overview",
        href: gp(),
      },
    ],
  },
  blockHeader: {
    side: "right",
    width: "18rem",
    bullets: [
      {
        text: "Header H links the parent and commits to the prior state and this block’s extrinsics.",
      },
      {
        text: "It also carries slot, author, entropy and seal data.",
      },
      {
        text: "Gray Paper 0.8.0 · §5 header",
        href: gp(),
      },
    ],
  },
  blockExtrinsics: {
    side: "left",
    width: "17rem",
    bullets: [
      {
        text: "Extrinsics E are the new inputs carried by this block.",
      },
      {
        text: "E = (E_T, E_D, E_P, E_A, E_G).",
      },
      {
        text: "Gray Paper 0.8.0 · §4.1 the block",
        href: gp(),
      },
    ],
  },
  extrinsicTickets: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Ticket proofs enter Safrole’s contest for future block-author slots.",
      },
      {
        text: "Gray Paper 0.8.0 · §6.7 ticket extrinsic",
        href: gp(),
      },
    ],
  },
  extrinsicDisputes: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Verdicts and proofs record decisions about challenged work-reports.",
      },
      {
        text: "Gray Paper 0.8.0 · §10 disputes",
        href: gp(),
      },
    ],
  },
  extrinsicPreimages: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Requested service blobs are supplied with their service index.",
      },
      {
        text: "Gray Paper 0.8.0 · §12.4 preimage integration",
        href: gp(),
      },
    ],
  },
  extrinsicAssurances: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Validators mark the cores whose work-package data they hold.",
      },
      { text: "These assurances concern reports admitted in earlier blocks, not this block’s new guarantees." },
      {
        text: "Gray Paper 0.8.0 · §11.2 assurances",
        href: gp(),
      },
    ],
  },
  extrinsicReports: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Guarantors submit signed work-reports produced in-core.",
      },
      { text: "Inclusion places them in pending availability; their results do not yet update service state." },
      {
        text: "Gray Paper 0.8.0 · §11.4 guarantees",
        href: gp(),
      },
    ],
  },
  stf: {
    side: "top",
    width: "18rem",
    bullets: [
      {
        text: "Υ maps prior state σ and block B to posterior state σ′.",
      },
      {
        text: "Its modules form a dependency graph; independent branches can run in parallel.",
      },
      {
        text: "The plates here are an index of operations, not a strict execution sequence.",
      },
      {
        text: "Gray Paper 0.8.0 · §4.2 state transition graph",
        href: gp(),
      },
    ],
  },
  stfHeader: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Checks header commitments and advances the current timeslot τ′.",
      },
      { text: "Gray Paper 0.8.0 · §5 header", href: gp() },
    ],
  },
  stfSafrole: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Checks the seal and advances entropy, tickets and validator-key state.",
      },
      { text: "Gray Paper 0.8.0 · §6 block production", href: gp() },
    ],
  },
  stfDisputes: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Records verdicts and clears reports judged uncertain or invalid.",
      },
      { text: "Gray Paper 0.8.0 · §10 disputes", href: gp() },
    ],
  },
  stfAssurances: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Counts availability votes and releases reports after a greater-than-two-thirds supermajority.",
      },
      { text: "Gray Paper 0.8.0 · §11.2 assurances", href: gp() },
    ],
  },
  stfReports: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Validates new guarantees and installs one pending report per core.",
      },
      { text: "Gray Paper 0.8.0 · §11.4 guarantees", href: gp() },
    ],
  },
  stfAccumulation: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Runs ready work-digests on-chain and updates service state." },
      { text: "Gray Paper 0.8.0 · §12 accumulation", href: gp() },
    ],
  },
  stfPreimages: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Integrates requested service blobs after accumulation." },
      { text: "Gray Paper 0.8.0 · §12.4 preimage integration", href: gp() },
    ],
  },
  stfAuthorizers: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Removes used authorizers and refills each core’s pool from its queue.",
      },
      { text: "Gray Paper 0.8.0 · §8 authorization", href: gp() },
    ],
  },
  stfHistory: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Commits the new block, reports and accumulation output into recent history.",
      },
      { text: "Gray Paper 0.8.0 · §7 recent history", href: gp() },
    ],
  },
  stfStatistics: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Records validator, core and service activity for this block." },
      { text: "Gray Paper 0.8.0 · §13 statistics", href: gp() },
    ],
  },
  cores: {
    side: "bottom",
    width: "28rem",
    bullets: [
      {
        text: "C = 341 cores; a core runs one work-package at a time.",
      },
      {
        text: "Active cores = |κ′|/3, capped at 341; three guarantors per core covers the validator set exactly.",
      },
      {
        text: "Cores are numbered 0–340; work may only be reported on the first |κ′|/3.",
      },
      {
        text: "JAM does not choose its validators: an external staking system updates the key set; active cores follow |κ′|.",
      },
      {
        text: "A validator is a machine running the protocol; it can hold several hats at once: guarantor, assurer, auditor.",
      },
      {
        text: "Guarantor: one of three per core; runs authorization and refine, signs a guarantee over the work-report hash.",
      },
      {
        text: "Assurer: every validator stores one erasure chunk per report and files an E_A bitfield of the cores’ data it holds.",
      },
      {
        text: "Auditor: selected in tranches, a new group every A = 8 seconds, to recheck reported work.",
      },
      {
        text: "Each core’s three guarantors rotate together to the next core every 10 timeslots; epoch randomness selects new trios.",
      },
      {
        text: "Access: each core’s pool α[c] of authorizer hashes gates refine; a used authorizer is removed and the queue ϕ[c] refills it each block.",
      },
      {
        text: "Gray Paper 0.8.0 · §4.9 core model and services",
        href: gp(),
      },
      {
        text: "Gray Paper 0.8.0 · §11.3 guarantor assignments",
        href: gp(),
      },
    ],
  },
  whyLaw: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "More state means more space occupied; as components spread, the time for causal resolution across them diverges.",
      },
      {
        text: "Fragment into independent subsystems to grow, and coherency is lost; keep one state, and scale is capped.",
      },
      {
        text: "Gray Paper 0.8.0 · §1.3 scaling under size-coherency antagonism",
        href: gp(),
      },
    ],
  },
  whyEthereum: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "One shared state; every node re-executes every computation to verify it, capping the throughput of the whole system.",
      },
      { text: "Gray Paper 0.8.0 · §2.2 Ethereum", href: gp() },
    ],
  },
  whyL2s: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Execution moves into side systems; data and commitments return, so cross-system calls wait on bridges or proofs.",
      },
      { text: "Gray Paper 0.8.0 · §2.2.1 snark roll-ups", href: gp() },
    ],
  },
  whySolana: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "Still one state, so the whole system runs as fast as one machine: it scales only by that machine getting faster, not by adding more of them.",
      },
    ],
  },
  whyPolkadot: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Intra-parachain: small size, full coherency." },
      { text: "Inter-parachain: higher overall size, without coherency." },
      {
        text: "XCMP is asynchronous and coarse-grained; interaction uses XCM.",
      },
      {
        text: "One validator set, Elves: categorically different security profile from bridged chains.",
      },
      { text: "Gray Paper 0.8.0 · §1.3 size-coherency antagonism", href: gp() },
      { text: "Gray Paper 0.8.0 · §2.1 Polkadot", href: gp() },
    ],
  },
  whyJam: {
    side: "right",
    width: "17rem",
    bullets: [
      {
        text: "In-core: a subset of validators runs refine; scalable, stateless.",
      },
      { text: "On-chain: all validators run accumulate into JAM state." },
      {
        text: "During accumulation, services can exchange deferred transfers within the same block.",
      },
      {
        text: "It pipelines a highly scalable, mostly coherent element to a synchronous, fully coherent element. Asynchrony is bounded to the pipeline. Partitioning is cache affinity on shared RAM, not a permanent shard.",
      },
      { text: "Gray Paper 0.8.0 · §1.3 size-coherency antagonism", href: gp() },
      {
        text: "Demystifying JAM · in-core vs on-chain",
        href: kian("inside-core-vs-on-the-chain"),
      },
    ],
  },
} as const satisfies Record<string, Term>;
