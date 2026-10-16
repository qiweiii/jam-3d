import { gp } from "../../content/source-links.ts";
import type { TermDefinition } from "../../content/term-definition.ts";

export const BLOCK_NOTES = {
  blockHeader: {
    side: "right",
    width: "18rem",
    bullets: [
      { text: "Header H links the parent and commits to the prior state and this block’s extrinsics." },
      { text: "It also carries slot, author, entropy and seal data." },
      { text: "Gray Paper 0.8.0 · §5 header", href: gp() },
    ],
  },
  blockExtrinsics: {
    side: "left",
    width: "17rem",
    bullets: [
      { text: "Extrinsics E are the new inputs carried by this block." },
      { text: "E = (E_T, E_D, E_P, E_A, E_G)." },
      { text: "Gray Paper 0.8.0 · §4.1 the block", href: gp() },
    ],
  },
  extrinsicTickets: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Ticket proofs enter Safrole’s contest for future block-author slots." },
      { text: "Gray Paper 0.8.0 · §6.7 ticket extrinsic", href: gp() },
    ],
  },
  extrinsicDisputes: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Verdicts and proofs record decisions about challenged work-reports." },
      { text: "Gray Paper 0.8.0 · §10 disputes", href: gp() },
    ],
  },
  extrinsicPreimages: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Requested service blobs are supplied with their service index." },
      { text: "Gray Paper 0.8.0 · §12.4 preimage integration", href: gp() },
    ],
  },
  extrinsicAssurances: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Validators mark the cores whose work-package data they hold." },
      { text: "These assurances concern reports admitted in earlier blocks, not this block’s new guarantees." },
      { text: "Gray Paper 0.8.0 · §11.2 assurances", href: gp() },
    ],
  },
  extrinsicReports: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Guarantors submit signed work-reports produced in-core." },
      { text: "Inclusion places them in pending availability; their results do not yet update service state." },
      { text: "Gray Paper 0.8.0 · §11.4 guarantees", href: gp() },
    ],
  },
  stf: {
    side: "top",
    width: "18rem",
    bullets: [
      { text: "Υ maps prior state σ and block B to posterior state σ′." },
      { text: "Its modules form a dependency graph; independent branches can run in parallel." },
      { text: "The plates here are an index of operations, not a strict execution sequence." },
      { text: "Gray Paper 0.8.0 · §4.2 state transition graph", href: gp() },
    ],
  },
  stfHeader: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Checks header commitments and advances the current timeslot τ′." },
      { text: "Gray Paper 0.8.0 · §5 header", href: gp() },
    ],
  },
  stfSafrole: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Checks the seal and advances entropy, tickets and validator-key state." },
      { text: "Gray Paper 0.8.0 · §6 block production", href: gp() },
    ],
  },
  stfDisputes: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Records verdicts and clears reports judged uncertain or invalid." },
      { text: "Gray Paper 0.8.0 · §10 disputes", href: gp() },
    ],
  },
  stfAssurances: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Counts availability votes and releases reports after a greater-than-two-thirds supermajority." },
      { text: "Gray Paper 0.8.0 · §11.2 assurances", href: gp() },
    ],
  },
  stfReports: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Validates new guarantees and installs one pending report per core." },
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
      { text: "Removes used authorizers and refills each core’s pool from its queue." },
      { text: "Gray Paper 0.8.0 · §8 authorization", href: gp() },
    ],
  },
  stfHistory: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "Commits the new block, reports and accumulation output into recent history." },
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
} as const satisfies Record<string, TermDefinition>;
