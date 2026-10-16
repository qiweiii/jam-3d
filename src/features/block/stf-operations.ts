import { BLOCK_NOTES } from "./block-notes";

export const STF_OPERATIONS = [
  { title: "Header + slot", meta: "Advance slot", symbol: "τ′", color: 0xe8b35d, term: BLOCK_NOTES.stfHeader },
  { title: "Safrole", meta: "Update safrole", symbol: "γ′ η′ κ′", color: 0xd6b45f, term: BLOCK_NOTES.stfSafrole },
  { title: "Disputes", meta: "Record verdicts", symbol: "ψ′", color: 0xd66b6b, term: BLOCK_NOTES.stfDisputes },
  {
    title: "Assurances",
    meta: "Release available reports",
    symbol: "ρ‡",
    color: 0x69c99b,
    term: BLOCK_NOTES.stfAssurances,
  },
  {
    title: "Accumulation",
    meta: "Apply ready work",
    symbol: "δ′ χ′ ϕ′ ι′",
    color: 0xe45a88,
    term: BLOCK_NOTES.stfAccumulation,
  },
  { title: "Reports", meta: "Install pending reports", symbol: "ρ′", color: 0x8c7cff, term: BLOCK_NOTES.stfReports },
  { title: "Recent history", meta: "Record block", symbol: "β′", color: 0x9ec8dc, term: BLOCK_NOTES.stfHistory },
  { title: "Authorizers", meta: "Refresh pools", symbol: "α′", color: 0xf07828, term: BLOCK_NOTES.stfAuthorizers },
  { title: "Preimages", meta: "Integrate blobs", symbol: "δ′", color: 0x5ec8e8, term: BLOCK_NOTES.stfPreimages },
  { title: "Statistics", meta: "Record activity", symbol: "π′", color: 0xb8c0c8, term: BLOCK_NOTES.stfStatistics },
] as const;
