import {
  BoxGeometry,
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
};

const BLOCK_EXTRINSICS = [
  { title: "tickets", meta: "E_T", color: 0xd6b45f, term: TERMS.extrinsicTickets },
  { title: "disputes", meta: "E_D", color: 0xd66b6b, term: TERMS.extrinsicDisputes },
  { title: "preimages", meta: "E_P", color: 0x5ec8e8, term: TERMS.extrinsicPreimages },
  { title: "assurances", meta: "E_A", color: 0x69c99b, term: TERMS.extrinsicAssurances },
  { title: "reports", meta: "E_G", color: 0x8c7cff, term: TERMS.extrinsicReports },
] as const;

const STF_STAGES = [
  { title: "header + slot", color: 0xe8b35d, term: TERMS.stfHeader },
  { title: "Safrole", color: 0xd6b45f, term: TERMS.stfSafrole },
  { title: "disputes", color: 0xd66b6b, term: TERMS.stfDisputes },
  { title: "assurances", color: 0x69c99b, term: TERMS.stfAssurances },
  { title: "reports", color: 0x8c7cff, term: TERMS.stfReports },
  { title: "accumulation", color: 0xe45a88, term: TERMS.stfAccumulation },
  { title: "preimages", color: 0x5ec8e8, term: TERMS.stfPreimages },
  { title: "authorizers", color: 0xf07828, term: TERMS.stfAuthorizers },
  { title: "recent history", color: 0x9ec8dc, term: TERMS.stfHistory },
  { title: "statistics", color: 0xb8c0c8, term: TERMS.stfStatistics },
] as const;

/** The block chain: recent blocks, connector line, STF stack in the block-to-block gap. */
export function buildChain(): Chain {
  const group = new Group();
  const blocks = new Group();
  group.add(blocks);
  const blockCount = 10;
  const nowBlock = NOW_BLOCK.clone();
  const blockGap = BLOCK_GAP;
  const oldestY = nowBlock.y - (blockCount - 1) * blockGap;
  const blockGeom = new BoxGeometry(0.15, 0.15, 0.15);

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
  currentBlock.position.copy(nowBlock);
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
    block.position.set(nowBlock.x, nowBlock.y - i * blockGap, nowBlock.z);
    block.scale.setScalar(1 - i * 0.04);
    blocks.add(block);
  }

  const blockDetail = new Group();
  blockDetail.position.copy(nowBlock);
  blockDetail.visible = false;
  const detailSize = 0.15;
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
  headerTag.position.set(nowBlock.x + 0.13, nowBlock.y + headerY, nowBlock.z);
  group.add(headerTag);
  wrapTerm(headerTag.element.querySelector(".tag-title") ?? headerTag.element, "header", TERMS.blockHeader);

  const extrinsicsTag = tag("extrinsics · E", "", "#d6b45f", "block");
  extrinsicsTag.position.set(nowBlock.x - 0.13, nowBlock.y - 0.024, nowBlock.z);
  group.add(extrinsicsTag);
  wrapTerm(
    extrinsicsTag.element.querySelector(".tag-title") ?? extrinsicsTag.element,
    "extrinsics",
    TERMS.blockExtrinsics,
  );

  for (const [i, part] of BLOCK_EXTRINSICS.entries()) {
    const partTag = tag(`${part.title} · ${part.meta}`, "", colorCss(part.color), "block");
    partTag.position.set(nowBlock.x + 0.13, nowBlock.y + extrinsicYs[i]!, nowBlock.z);
    group.add(partTag);
    wrapTerm(partTag.element.querySelector(".tag-title") ?? partTag.element, part.title, part.term);
  }

  blocks.add(
    new Mesh(
      new TubeGeometry(
        makeCurve([
          [nowBlock.x, nowBlock.y, nowBlock.z],
          [nowBlock.x, oldestY, nowBlock.z],
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
  stf.position.set(nowBlock.x, nowBlock.y - blockGap / 2, nowBlock.z);
  stf.scale.setScalar(0.38);
  const plateGeom = new BoxGeometry(0.27, 0.022, 0.16);
  const stageGap = 0.037;
  for (const [i, stage] of STF_STAGES.entries()) {
    const y = ((STF_STAGES.length - 1) / 2 - i) * stageGap;
    const plate = new Mesh(
      plateGeom,
      new MeshStandardMaterial({
        color: 0x12151b,
        emissive: stage.color,
        emissiveIntensity: 0.48,
        roughness: 0.4,
        metalness: 0.24,
      }),
    );
    plate.position.y = y;
    stf.add(plate);

    const stageTag = tag(stage.title, "", colorCss(stage.color), "stf");
    stageTag.position.set(-0.21, y, 0);
    stf.add(stageTag);
    wrapTerm(stageTag.element.querySelector(".tag-title") ?? stageTag.element, stage.title, stage.term);
  }
  group.add(stf);

  const stfTag = tag("STF", "σ → σ′", "#f4f1ea", "stf");
  stfTag.position.set(-0.21, 0.21, 0);
  stf.add(stfTag);
  wrapTerm(stfTag.element.querySelector(".tag-title") ?? stfTag.element, "STF", TERMS.stf);

  return { group, currentBlock, blockDetail, stf };
}
