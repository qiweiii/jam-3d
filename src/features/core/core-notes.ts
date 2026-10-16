import { gp } from "../../content/source-links.ts";
import type { TermDefinition } from "../../content/term-definition.ts";

export const CORE_NOTES = {
  preimage: {
    side: "bottom",
    width: "17rem",
    bullets: [
      { text: "A preimage is the original blob behind a hash H(blob)." },
      { text: "Services keep blobs in their service account δ and fetch them by hash, on-chain." },
      { text: "Gray Paper 0.8.0 · §9 preimage lookups", href: gp() },
    ],
  },
  upload: {
    side: "bottom",
    width: "17rem",
    bullets: [
      { text: "Preimages enter on-chain through the preimages extrinsic E_P, addressed to a service." },
      { text: "Gray Paper 0.8.0 · §4.1 the block", href: gp() },
    ],
  },
  store: {
    side: "bottom",
    width: "18rem",
    bullets: [
      { text: "Held per service on-chain: blobs keyed by their hash, availability tracked since when." },
      { text: "Unreferenced blobs may be expunged after D = 19,200 timeslots ≈ 32 hours." },
      { text: "Gray Paper 0.8.0 · §9 service state", href: gp() },
    ],
  },
  past: {
    side: "bottom",
    width: "16rem",
    bullets: [{ text: "Earlier work built on: imported segments fetched from the D³L, by root and index." }],
  },
  new: {
    side: "bottom",
    width: "16rem",
    bullets: [
      { text: "The fresh package's whole bundle fits within W_B ≈ 13.8 MB: payloads, extrinsics, imports, auth data." },
      { text: "Gray Paper 0.8.0 · §14 work packages and reports", href: gp() },
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
      { text: "In-core PVM: authorize + refine on this core." },
      { text: "Accumulate is on-chain, a different entry point, with service state." },
      { text: "Virtual hardware: 25–50% of a native core, 2 GB of RAM, 2 MB/s of i/o, 6-second segments." },
    ],
  },
  refine: {
    side: "bottom",
    width: "16rem",
    bullets: [{ text: "In-core: heavy work → a work-report. Does not write the service account." }],
  },
  stateAccess: {
    side: "bottom",
    width: "17rem",
    bullets: [
      { text: "Accumulation runs on-chain with access to service state." },
      { text: "It can read and update state." },
      { text: "Gray Paper 0.8.0 · §4.9 in-core and on-chain", href: gp() },
    ],
  },
} as const satisfies Record<string, TermDefinition>;
