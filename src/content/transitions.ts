import { TERMS } from "./references";

export const BLOCK_EXTRINSICS = [
  { title: "Tickets", meta: "E_T", color: 0xd6b45f, term: TERMS.extrinsicTickets },
  { title: "Disputes", meta: "E_D", color: 0xd66b6b, term: TERMS.extrinsicDisputes },
  { title: "Preimages", meta: "E_P", color: 0x5ec8e8, term: TERMS.extrinsicPreimages },
  { title: "Assurances", meta: "E_A", color: 0x69c99b, term: TERMS.extrinsicAssurances },
  { title: "Reports", meta: "E_G", color: 0x8c7cff, term: TERMS.extrinsicReports },
] as const;

export const STF_STAGES = [
  { title: "Header + slot", meta: "Advance slot", symbol: "τ′", color: 0xe8b35d, term: TERMS.stfHeader },
  { title: "Safrole", meta: "Update safrole", symbol: "γ′ η′ κ′", color: 0xd6b45f, term: TERMS.stfSafrole },
  { title: "Disputes", meta: "Record verdicts", symbol: "ψ′", color: 0xd66b6b, term: TERMS.stfDisputes },
  { title: "Assurances", meta: "Release available reports", symbol: "ρ‡", color: 0x69c99b, term: TERMS.stfAssurances },
  { title: "Accumulation", meta: "Apply ready work", symbol: "δ′ χ′ ϕ′ ι′", color: 0xe45a88, term: TERMS.stfAccumulation },
  { title: "Reports", meta: "Install pending reports", symbol: "ρ′", color: 0x8c7cff, term: TERMS.stfReports },
  { title: "Recent history", meta: "Record block", symbol: "β′", color: 0x9ec8dc, term: TERMS.stfHistory },
  { title: "Authorizers", meta: "Refresh pools", symbol: "α′", color: 0xf07828, term: TERMS.stfAuthorizers },
  { title: "Preimages", meta: "Integrate blobs", symbol: "δ′", color: 0x5ec8e8, term: TERMS.stfPreimages },
  { title: "Statistics", meta: "Record activity", symbol: "π′", color: 0xb8c0c8, term: TERMS.stfStatistics },
] as const;
