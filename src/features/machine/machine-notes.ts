import { gp, kian } from "../../content/source-links.ts";
import type { TermDefinition } from "../../content/term-definition.ts";

export const MACHINE_NOTES = {
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
      { text: "Aggregate availability ≈ 682 MB/s; ≈ 2 PB retained network-wide, at most ≈ 6 TB per node." },
      {
        text: "A greater-than-two-thirds majority of assurance bits makes the report available to accumulate; without it the assignment is dropped after U = 5 slots.",
      },
      { text: "Gray Paper 0.8.0 · §11 reporting and assurance", href: gp() },
      { text: "Gray Paper 0.8.0 · §14 D³L", href: gp() },
      { text: "Gray Paper 0.8.0 · §20 performance", href: gp() },
      { text: "Demystifying JAM · in-core vs on-chain vs DA", href: kian("inside-core-vs-on-the-chain") },
      { text: "Demystifying JAM · data sharding", href: kian("appendix-data-sharding") },
    ],
  },
  cores: {
    side: "bottom",
    width: "28rem",
    bullets: [
      { text: "C = 341 cores; a core runs one work-package at a time." },
      { text: "Active cores = |κ′|/3, capped at 341; three guarantors per core covers the validator set exactly." },
      { text: "Cores are numbered 0–340; work may only be reported on the first |κ′|/3." },
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
      { text: "Auditor: selected in tranches, a new group every A = 8 seconds, to recheck reported work." },
      {
        text: "Each core’s three guarantors rotate together to the next core every 10 timeslots; epoch randomness selects new trios.",
      },
      {
        text: "Access: each core’s pool α[c] of authorizer hashes gates refine; a used authorizer is removed and the queue ϕ[c] refills it each block.",
      },
      { text: "Gray Paper 0.8.0 · §4.9 core model and services", href: gp() },
      { text: "Gray Paper 0.8.0 · §11.3 guarantor assignments", href: gp() },
    ],
  },
} as const satisfies Record<string, TermDefinition>;
