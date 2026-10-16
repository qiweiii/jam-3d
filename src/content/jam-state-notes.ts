import { gp } from "./source-links.ts";
import type { TermDefinition } from "./term-definition.ts";

export const JAM_STATE_NOTES = {
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
      { text: "Blocks commit only its 32-octet root H_R = M_σ(σ)." },
      { text: "Gray Paper 0.8.0 · §4.2 the state", href: gp() },
      { text: "Gray Paper 0.8.0 · §5 the header", href: gp() },
    ],
  },
  statePost: {
    side: "left",
    width: "17rem",
    bullets: [
      { text: "σ′ = Υ(σ, B): the state after this block's transition." },
      { text: "The next block's header commits root(σ′), so Merklization pipelines into block production." },
      { text: "Gray Paper 0.8.0 · §4 overview", href: gp() },
    ],
  },
} as const satisfies Record<string, TermDefinition>;
