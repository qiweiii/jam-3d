/** Gray Paper reader + secondary notes. Default draft is 0.8.0. */

export const GP_DRAFT = "0.8.0";
/** First 7 chars of the 0.8.0 paper hash on Fluffy Labs. */
export const GP_VER = "07f041d";
export const GP_READER = "https://graypaper.fluffylabs.dev";
export const KIAN_JAM = "https://blog.kianenigma.com/posts/tech/demystifying-jam/";

/**
 * Fluffy Labs reader, draft 0.8.0.
 * Pass `selection` copied from the reader hash after highlighting text
 * (`<start><end>`, 12 hex chars). Do not invent page indexes — a zero-width
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
        text: "Distributed data lake (D³L): the big blobs behind a work-report, as erasure-coded chunks keyed by the report’s erasure-root and segment-root.",
      },
      {
        text: "What it holds: the work-package bundle (package, extrinsics, imported segments, proofs) and exported segments later work can import.",
      },
      {
        text: "Who stores it: three guarantors on that core this slot encode the blob and send one chunk to each validator. Each validator, as assurer, keeps their chunk. Rebuild needs on the order of 342 pieces (C = 341, V = 1023 in these drafts).",
      },
      {
        text: "Aggregate availability ≈ 682 MB/s; ≈ 2 PB retained network-wide.",
      },
      {
        text: "If a supermajority assures on-chain, the report is available and may accumulate. Otherwise it times out.",
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
        text: "The fresh package's whole bundle — payloads, extrinsics, imports, auth data — is ≤ W_B ≈ 13.8 MB.",
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
        text: "Work out: the work-report, with results capped at W_R ≈ 48 KB per package.",
      },
    ],
  },
  pvm: {
    side: "bottom",
    width: "18rem",
    bullets: [
      {
        text: "In-core PVM: authorize + refine on this core. Not service storage.",
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
  cores: {
    side: "bottom",
    width: "28rem",
    bullets: [
      {
        text: "C = 341 cores; a core runs one work-package at a time.",
      },
      {
        text: "Active cores = |κ′|/3, capped at 341 — three guarantors per core covers the validator set exactly.",
      },
      {
        text: "Cores are numbered 0–340; work may only be reported on the first |κ′|/3.",
      },
      {
        text: "JAM does not choose its validators — an external staking system updates the key set; active cores follow |κ′|.",
      },
      {
        text: "A validator is a machine running the protocol; it can hold several hats at once — guarantor, assurer, auditor.",
      },
      {
        text: "Guarantor: one of three per core; runs authorization and refine, signs a guarantee over the work-report hash.",
      },
      {
        text: "Assurer: every validator stores one erasure chunk per report and files an E_A bitfield of the cores’ data it holds.",
      },
      {
        text: "Auditor: selected in tranches — a new group every A = 8 seconds — to recheck reported work.",
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
        text: "Gray Paper 0.8.0 · §8 authorization",
        href: gp(),
      },
      {
        text: "Gray Paper 0.8.0 · §11.3 guarantor assignments",
        href: gp(),
      },
      {
        text: "Gray Paper 0.8.0 · §17 auditing",
        href: gp(),
      },
    ],
  },
} as const satisfies Record<string, Term>;
