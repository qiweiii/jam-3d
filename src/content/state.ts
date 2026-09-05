/** Gray Paper 0.8.0 §4.2, in the paper's tuple order. These are data, not STF stages. */
export const STATE_COMPONENTS = [
  { symbol: "α", name: "Authorizer pools", color: 0xf07828 },
  { symbol: "β", name: "Recent history", color: 0x9ec8dc },
  { symbol: "θ", name: "Accumulation outputs", color: 0xe45a88 },
  { symbol: "γ", name: "Safrole", color: 0xd6b45f },
  { symbol: "δ", name: "Service accounts", color: 0xe45a88 },
  { symbol: "η", name: "Entropy", color: 0xd6b45f },
  { symbol: "ι", name: "Queued validator keys", color: 0xd6b45f },
  { symbol: "κ", name: "Active validator keys", color: 0xd6b45f },
  { symbol: "λ", name: "Previous validator keys", color: 0xd6b45f },
  { symbol: "ρ", name: "Pending reports", color: 0x8c7cff },
  { symbol: "τ", name: "Timeslot", color: 0xe8b35d },
  { symbol: "φ", name: "Authorizer queues", color: 0xf07828 },
  { symbol: "χ", name: "Privileged services", color: 0xe45a88 },
  { symbol: "ψ", name: "Disputes", color: 0xd66b6b },
  { symbol: "π", name: "Activity statistics", color: 0xb8c0c8 },
  { symbol: "ω", name: "Accumulation queue", color: 0x69c99b },
  { symbol: "ξ", name: "Accumulation history", color: 0x9ec8dc },
] as const;

export const STATE_SOURCE = "https://github.com/gavofyork/graypaper/blob/v0.8.0/text/overview.tex#L30-L67";
