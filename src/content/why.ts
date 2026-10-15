/** Rationale arc: the law, four prior answers, JAM. Copy distilled from study notes on GP §1.3, §2, §4. */
export const WHY_STOPS = [
  {
    id: "law",
    title: "Size-coherency antagonism",
    body: "More state means more space; more space means greater mean and variance of distances between state-components; the time for causal resolution then diverges across the system, causing incoherence. Fragmentation is the usual escape; JAM explores the middle ground.",
    duration: 6,
  },
  {
    id: "ethereum",
    title: "Ethereum",
    body: "Everyone shares one small room: fully coherent, but everyone repeats every computation, so the room must stay small.",
    duration: 6,
  },
  {
    id: "l2s",
    title: "L2s",
    body: "Fragmentation, applied: work moves into side rooms, each small enough to stay coherent. Data and commitments return to the main room; cross-room calls wait on bridges or proofs.",
    duration: 6,
  },
  {
    id: "solana",
    title: "Solana",
    body: "The single room grows huge and fast: still one conversation for all, but only expensive hardware can stay in it.",
    duration: 6,
  },
  {
    id: "polkadot",
    title: "Polkadot",
    body: "Each room is a parachain, small and fully coherent. Scale comes from adding rooms; between them there is no shared state, only asynchronous coarse-grained messages.",
    duration: 6,
  },
  {
    id: "jam",
    title: "JAM",
    body: "JAM runs work-packages across many cores in parallel, then brings their results together in shared on-chain state: coordination waits for the pipeline, but state need not remain permanently fragmented.",
    duration: 7,
  },
] as const;
