import { gp, kian } from "../../content/source-links.ts";
import type { TermDefinition } from "../../content/term-definition.ts";

export const WHY_JAM_NOTES = {
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
      { text: "Gray Paper 0.8.0 · §1.3 scaling under size-coherency antagonism", href: gp() },
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
      { text: "XCMP is asynchronous and coarse-grained; interaction uses XCM." },
      { text: "One validator set, Elves: categorically different security profile from bridged chains." },
      { text: "Gray Paper 0.8.0 · §1.3 size-coherency antagonism", href: gp() },
      { text: "Gray Paper 0.8.0 · §2.1 Polkadot", href: gp() },
    ],
  },
  whyJam: {
    side: "right",
    width: "17rem",
    bullets: [
      { text: "In-core: a subset of validators runs refine; scalable, stateless." },
      { text: "On-chain: all validators run accumulate into JAM state." },
      { text: "During accumulation, services can exchange deferred transfers within the same block." },
      {
        text: "It pipelines a highly scalable, mostly coherent element to a synchronous, fully coherent element. Asynchrony is bounded to the pipeline. Partitioning is cache affinity on shared RAM, not a permanent shard.",
      },
      { text: "Gray Paper 0.8.0 · §1.3 size-coherency antagonism", href: gp() },
      { text: "Demystifying JAM · in-core vs on-chain", href: kian("inside-core-vs-on-the-chain") },
    ],
  },
} as const satisfies Record<string, TermDefinition>;
