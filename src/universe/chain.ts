import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TubeGeometry,
} from "three";
import { BLOCK_GAP, NOW_BLOCK } from "../lod";
import { wrapTerm } from "../bubble";
import { TERMS } from "../refs";
import { makeCurve } from "./streams";
import { tag } from "./tag";

export type Chain = {
  group: Group;
  currentBlock: Mesh;
  blockDetail: Group;
  stf: Group;
  stateRail: Group;
  /** Drive the stage light pulse; `t` is seconds. */
  stfPulse: (t: number) => void;
};

const BLOCK_EXTRINSICS = [
  { title: "tickets", meta: "E_T", color: 0xd6b45f, term: TERMS.extrinsicTickets },
  { title: "disputes", meta: "E_D", color: 0xd66b6b, term: TERMS.extrinsicDisputes },
  { title: "preimages", meta: "E_P", color: 0x5ec8e8, term: TERMS.extrinsicPreimages },
  { title: "assurances", meta: "E_A", color: 0x69c99b, term: TERMS.extrinsicAssurances },
  { title: "reports", meta: "E_G", color: 0x8c7cff, term: TERMS.extrinsicReports },
] as const;

const STF_STAGES = [
  { title: "header + slot", meta: "τ′", color: 0xe8b35d, term: TERMS.stfHeader },
  { title: "Safrole", meta: "γ′ η′ κ′", color: 0xd6b45f, term: TERMS.stfSafrole },
  { title: "disputes", meta: "ψ′", color: 0xd66b6b, term: TERMS.stfDisputes },
  { title: "assurances", meta: "ρ‡", color: 0x69c99b, term: TERMS.stfAssurances },
  { title: "reports", meta: "ρ′", color: 0x8c7cff, term: TERMS.stfReports },
  { title: "accumulation", meta: "δ′ χ′ ϕ′ ι′", color: 0xe45a88, term: TERMS.stfAccumulation },
  { title: "preimages", meta: "δ′", color: 0x5ec8e8, term: TERMS.stfPreimages },
  { title: "authorizers", meta: "α′", color: 0xf07828, term: TERMS.stfAuthorizers },
  { title: "recent history", meta: "β′", color: 0x9ec8dc, term: TERMS.stfHistory },
  { title: "statistics", meta: "π′", color: 0xb8c0c8, term: TERMS.stfStatistics },
] as const;

/** Block rail offset left of the chain axis; the state rail mirrors it right. */
const RAIL_OFFSET = 0.05;

/** The block chain as twin rails in the on-chain river: block cubes and state databases. */
export function buildChain(): Chain {
  const group = new Group();
  const blocks = new Group();
  group.add(blocks);
  const blockCount = 10;
  const nowBlock = NOW_BLOCK.clone();
  const blockX = nowBlock.x - RAIL_OFFSET;
  const stateX = nowBlock.x + RAIL_OFFSET;
  const blockGap = BLOCK_GAP;
  const oldestY = nowBlock.y - (blockCount - 1) * blockGap;
  const blockGeom = new BoxGeometry(0.09, 0.09, 0.09);

  const currentBlock = new Mesh(
    blockGeom,
    new MeshStandardMaterial({
      color: 0x2a2214,
      emissive: 0xf0a03c,
      emissiveIntensity: 0.9,
      roughness: 0.45,
      metalness: 0.2,
    }),
  );
  currentBlock.position.set(blockX, nowBlock.y, nowBlock.z);
  blocks.add(currentBlock);

  for (let i = 1; i < blockCount; i++) {
    const block = new Mesh(
      blockGeom,
      new MeshStandardMaterial({
        color: 0x1d2028,
        emissive: 0x3a2a12,
        emissiveIntensity: 0.3,
        roughness: 0.45,
        metalness: 0.2,
        transparent: true,
        opacity: 1 - i * 0.08,
      }),
    );
    block.position.set(blockX, nowBlock.y - i * blockGap, nowBlock.z);
    block.scale.setScalar(1 - i * 0.04);
    blocks.add(block);
  }

  const stateRail = new Group();
  const stateDiscGeom = new CylinderGeometry(0.036, 0.036, 0.006, 20);
  const discGap = 0.001;
  const discSpan = stateDiscGeom.parameters.height + discGap;
  for (let i = 0; i < blockCount; i++) {
    const state = new Group();
    const fresh = i === 0;
    for (const [d, stage] of STF_STAGES.entries()) {
      const disc = new Mesh(
        stateDiscGeom,
        new MeshStandardMaterial({
          color: 0x12151b,
          emissive: stage.color,
          emissiveIntensity: fresh ? 0.55 : 0.3,
          roughness: 0.35,
          metalness: 0.2,
          transparent: true,
          opacity: 1 - i * 0.08,
        }),
      );
      disc.position.y = (d - (STF_STAGES.length - 1) / 2) * discSpan;
      state.add(disc);
    }
    state.position.set(stateX, nowBlock.y - i * blockGap, nowBlock.z);
    state.scale.setScalar(1 - i * 0.04);
    stateRail.add(state);
  }
  group.add(stateRail);

  const blockDetail = new Group();
  blockDetail.position.set(blockX, nowBlock.y, nowBlock.z);
  blockDetail.visible = false;
  const detailSize = 0.09;
  const sectionGap = 0.002;
  const headerHeight = detailSize * 0.3;
  const extrinsicHeight = (detailSize - headerHeight - sectionGap * BLOCK_EXTRINSICS.length) / BLOCK_EXTRINSICS.length;
  let sectionTop = detailSize / 2;
  const addSection = (height: number, color: number, intensity: number) => {
    const section = new Mesh(
      new BoxGeometry(detailSize, height, detailSize),
      new MeshStandardMaterial({
        color: 0x15171d,
        emissive: color,
        emissiveIntensity: intensity,
        roughness: 0.4,
        metalness: 0.24,
      }),
    );
    section.position.y = sectionTop - height / 2;
    sectionTop -= height + sectionGap;
    blockDetail.add(section);
    return section.position.y;
  };

  const headerY = addSection(headerHeight, 0xf0a03c, 0.95);
  const extrinsicYs = BLOCK_EXTRINSICS.map((part) => addSection(extrinsicHeight, part.color, 0.72));
  group.add(blockDetail);

  const colorCss = (color: number) => `#${color.toString(16).padStart(6, "0")}`;
  const headerTag = tag("header · H", "", "#e8b35d", "block");
  headerTag.position.set(blockX - 0.09, nowBlock.y + headerY, nowBlock.z);
  group.add(headerTag);
  wrapTerm(headerTag.element.querySelector(".tag-title") ?? headerTag.element, "header", TERMS.blockHeader);

  const extrinsicsTag = tag("extrinsics · E", "", "#d6b45f", "block");
  extrinsicsTag.position.set(blockX - 0.09, nowBlock.y - 0.055, nowBlock.z);
  group.add(extrinsicsTag);
  wrapTerm(
    extrinsicsTag.element.querySelector(".tag-title") ?? extrinsicsTag.element,
    "extrinsics",
    TERMS.blockExtrinsics,
  );

  for (const [i, part] of BLOCK_EXTRINSICS.entries()) {
    const partTag = tag(`${part.title} · ${part.meta}`, "", colorCss(part.color), "block");
    partTag.position.set(blockX - 0.09, nowBlock.y + extrinsicYs[i]!, nowBlock.z);
    group.add(partTag);
    wrapTerm(partTag.element.querySelector(".tag-title") ?? partTag.element, part.title, part.term);
  }

  blocks.add(
    new Mesh(
      new TubeGeometry(
        makeCurve([
          [blockX, nowBlock.y, nowBlock.z],
          [blockX, oldestY, nowBlock.z],
        ]),
        32,
        0.006,
        6,
        false,
      ),
      new MeshBasicMaterial({ color: 0x6a4a1a, transparent: true, opacity: 0.8 }),
    ),
  );

  const stf = new Group();
  stf.position.set(stateX, nowBlock.y - blockGap / 2, nowBlock.z);
  stf.scale.setScalar(0.38);
  const plateGeom = new BoxGeometry(0.22, 0.018, 0.13);
  const stageGap = 0.03;
  const stageMaterials: MeshStandardMaterial[] = [];
  for (const [i, stage] of STF_STAGES.entries()) {
    const y = ((STF_STAGES.length - 1) / 2 - i) * stageGap;
    const material = new MeshStandardMaterial({
      color: 0x12151b,
      emissive: stage.color,
      emissiveIntensity: 0.48,
      roughness: 0.4,
      metalness: 0.24,
    });
    stageMaterials.push(material);
    const plate = new Mesh(plateGeom, material);
    plate.position.y = y;
    stf.add(plate);

    const stageTag = tag(stage.title, stage.meta, colorCss(stage.color), "stf");
    stageTag.position.set(-0.17, y, 0);
    stf.add(stageTag);
    wrapTerm(stageTag.element.querySelector(".tag-title") ?? stageTag.element, stage.title, stage.term);
  }
  const stfPulse = (t: number) => {
    const p = (t % 2.4) / 2.4;
    for (const [i, material] of stageMaterials.entries()) {
      const u = (STF_STAGES.length - 1 - i) / (STF_STAGES.length - 1);
      const distance = (u - p) / 0.16;
      material.emissiveIntensity = 0.48 + 0.55 * Math.exp(-distance * distance);
    }
  };
  group.add(stf);

  const stfTag = tag("STF", "σ → σ′", "#f4f1ea", "stf");
  stfTag.position.set(-0.17, 0.21, 0);
  stf.add(stfTag);
  wrapTerm(stfTag.element.querySelector(".tag-title") ?? stfTag.element, "STF", TERMS.stf);

  const stateTag = tag("state σ", "prior", "#5ec8e8", ["block", "stf"]);
  stateTag.position.set(stateX + 0.055, nowBlock.y - 0.21, nowBlock.z);
  group.add(stateTag);
  wrapTerm(stateTag.element.querySelector(".tag-title") ?? stateTag.element, "state σ", TERMS.state);

  const statePostTag = tag("state σ′", "posterior", "#7fe0ff", ["block", "stf"]);
  statePostTag.position.set(stateX + 0.055, nowBlock.y - 0.045, nowBlock.z);
  group.add(statePostTag);
  wrapTerm(statePostTag.element.querySelector(".tag-title") ?? statePostTag.element, "state σ′", TERMS.statePost);

  return { group, currentBlock, blockDetail, stf, stateRail, stfPulse };
}
