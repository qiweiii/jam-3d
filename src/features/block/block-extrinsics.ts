import { BLOCK_NOTES } from "./block-notes";

export const BLOCK_EXTRINSICS = [
  { title: "Tickets", meta: "E_T", color: 0xd6b45f, term: BLOCK_NOTES.extrinsicTickets },
  { title: "Disputes", meta: "E_D", color: 0xd66b6b, term: BLOCK_NOTES.extrinsicDisputes },
  { title: "Preimages", meta: "E_P", color: 0x5ec8e8, term: BLOCK_NOTES.extrinsicPreimages },
  { title: "Assurances", meta: "E_A", color: 0x69c99b, term: BLOCK_NOTES.extrinsicAssurances },
  { title: "Reports", meta: "E_G", color: 0x8c7cff, term: BLOCK_NOTES.extrinsicReports },
] as const;
