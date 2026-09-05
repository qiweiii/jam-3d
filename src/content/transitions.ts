import { TERMS } from "./references";

export const BLOCK_EXTRINSICS = [
  { title: "tickets", meta: "E_T", color: 0xd6b45f, term: TERMS.extrinsicTickets },
  { title: "disputes", meta: "E_D", color: 0xd66b6b, term: TERMS.extrinsicDisputes },
  { title: "preimages", meta: "E_P", color: 0x5ec8e8, term: TERMS.extrinsicPreimages },
  { title: "assurances", meta: "E_A", color: 0x69c99b, term: TERMS.extrinsicAssurances },
  { title: "reports", meta: "E_G", color: 0x8c7cff, term: TERMS.extrinsicReports },
] as const;

export const STF_STAGES = [
  { title: "header + slot", meta: "advance slot", symbol: "τ′", color: 0xe8b35d, term: TERMS.stfHeader },
  { title: "Safrole", meta: "update safrole", symbol: "γ′ η′ κ′", color: 0xd6b45f, term: TERMS.stfSafrole },
  { title: "disputes", meta: "record verdicts", symbol: "ψ′", color: 0xd66b6b, term: TERMS.stfDisputes },
  { title: "assurances", meta: "release available reports", symbol: "ρ‡", color: 0x69c99b, term: TERMS.stfAssurances },
  { title: "reports", meta: "install pending reports", symbol: "ρ′", color: 0x8c7cff, term: TERMS.stfReports },
  { title: "accumulation", meta: "apply ready work", symbol: "δ′ χ′ φ′ ι′", color: 0xe45a88, term: TERMS.stfAccumulation },
  { title: "preimages", meta: "integrate blobs", symbol: "δ′", color: 0x5ec8e8, term: TERMS.stfPreimages },
  { title: "authorizers", meta: "refresh pools", symbol: "α′", color: 0xf07828, term: TERMS.stfAuthorizers },
  { title: "recent history", meta: "record block", symbol: "β′", color: 0x9ec8dc, term: TERMS.stfHistory },
  { title: "statistics", meta: "record activity", symbol: "π′", color: 0xb8c0c8, term: TERMS.stfStatistics },
] as const;
