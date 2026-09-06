/** Gray Paper 0.8.0 §4.2, in the paper's tuple order. These are data, not STF stages. */
export const STATE_COMPONENTS = [
  { symbol: "α", name: "Authorizer pools", color: 0xf07828, note: "The authorizers allowed on each core; work may be reported only under one of them." },
  { symbol: "β", name: "Recent history", color: 0x9ec8dc, note: "The most recent blocks' header hashes and state roots, plus the accumulation output log." },
  { symbol: "θ", name: "Accumulation outputs", color: 0xe45a88, note: "The accumulation output log: service-indexed commitments yielded by accumulation." },
  { symbol: "γ", name: "Safrole", color: 0xd6b45f, note: "All state for determining block authors: pending keys, ring root, ticket accumulator, seal-key series." },
  { symbol: "δ", name: "Service accounts", color: 0xe45a88, note: "The portion of state dealing with services, analogous to the Yellow Paper's accounts." },
  { symbol: "η", name: "Entropy", color: 0xd6b45f, note: "The on-chain entropy pool: one live value plus snapshots at the last three epoch boundaries." },
  { symbol: "ι", name: "Queued validator keys", color: 0xd6b45f, note: "The staged validator keys, reset into Safrole's pending set at the start of each epoch." },
  { symbol: "κ", name: "Active validator keys", color: 0xd6b45f, note: "The active validator set, the actors privileged to build and maintain the chain." },
  { symbol: "λ", name: "Previous validator keys", color: 0xd6b45f, note: "The archived validator keys of the previous epoch, kept for verdict signature checks." },
  { symbol: "ρ", name: "Pending reports", color: 0x8c7cff, note: "Each core's assigned work-report guarantee, still awaiting availability assurance by a super-majority." },
  { symbol: "τ", name: "Timeslot", color: 0xe8b35d, note: "The most recent block's timeslot index, six-second periods since the Jam common era." },
  { symbol: "φ", name: "Authorizer queues", color: 0xf07828, note: "The authorizer queue of each core, from which the pool α is refilled each block." },
  { symbol: "χ", name: "Privileged services", color: 0xe45a88, note: "The identities of services holding privileged status, five kinds from manager to always-accumulate." },
  { symbol: "ψ", name: "Disputes", color: 0xd66b6b, note: "The good, bad and wonky verdict sets, plus the punish set of offending keys." },
  { symbol: "π", name: "Activity statistics", color: 0xb8c0c8, note: "Validator statistics per epoch and core and service activity per block, for the staking system." },
  { symbol: "ω", name: "Accumulation queue", color: 0x69c99b, note: "Reports ready but not yet accumulated, each with its unfulfilled dependencies, at most an epoch deep." },
  { symbol: "ξ", name: "Accumulation history", color: 0x9ec8dc, note: "The accumulated work-package hashes of the past epoch, the dependency history." },
] as const;

export const STATE_SOURCE = "https://github.com/gavofyork/graypaper/blob/v0.8.0/text/overview.tex#L30-L67";
