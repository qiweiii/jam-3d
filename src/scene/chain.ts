import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TubeGeometry,
} from "three";
import { BLOCK_GAP, NOW_BLOCK } from "./layout";
import { wrapTerm } from "../ui/bubble";
import { TERMS } from "../content/references";
import { BLOCK_EXTRINSICS, STF_STAGES } from "../content/transitions";
import { STATE_COMPONENTS, STATE_SOURCE } from "../content/state";
import { makeCurve } from "./streams";
import { tag } from "./tag";

export type Chain = {
  group: Group;
  currentBlock: Mesh;
  blockDetail: Group;
  stf: Group;
  stateRail: Group;
};

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
    for (const [d, component] of STATE_COMPONENTS.entries()) {
      const disc = new Mesh(
        stateDiscGeom,
        new MeshStandardMaterial({
          color: 0x12151b,
          emissive: component.color,
          emissiveIntensity: fresh ? 0.55 : 0.3,
          roughness: 0.35,
          metalness: 0.2,
          transparent: true,
          opacity: 1 - i * 0.08,
        }),
      );
      disc.position.y = ((STATE_COMPONENTS.length - 1) / 2 - d) * discSpan;
      state.add(disc);
      if (fresh) {
        const labelText = `${component.symbol}′ · ${component.name}`;
        const label = tag(labelText, "", "#e8e6e0", "block");
        label.element.classList.add("state-symbol");
        label.position.set(0.07, disc.position.y, 0.039);
        wrapTerm(label.element, labelText, {
          side: "right",
          bullets: [{ text: component.note }, { text: "Gray Paper 0.8.0 · §4.2 state", href: STATE_SOURCE }],
        }, `${component.symbol}′ · ${component.name}`);
        state.add(label);
      }
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
  const headerTag = tag("Header · H", "", "#e8b35d", ["block", "stf"]);
  headerTag.position.set(blockX - 0.09, nowBlock.y + headerY, nowBlock.z);
  group.add(headerTag);
  wrapTerm(headerTag.element.querySelector(".tag-title") ?? headerTag.element, "header", TERMS.blockHeader);

  for (const [i, part] of BLOCK_EXTRINSICS.entries()) {
    const partTag = tag(`${part.title} · ${part.meta}`, "", colorCss(part.color), ["block", "stf"]);
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
  stf.scale.setScalar(0.34);
  const plateGeom = new BoxGeometry(0.18, 0.014, 0.11);
  const stageGap = 0.022;
  for (const [i, stage] of STF_STAGES.entries()) {
    const y = ((STF_STAGES.length - 1) / 2 - i) * stageGap;
    const material = new MeshStandardMaterial({
      color: 0x12151b,
      emissive: stage.color,
      emissiveIntensity: 0.48,
      roughness: 0.4,
      metalness: 0.24,
    });
    const plate = new Mesh(plateGeom, material);
    plate.position.y = y;
    stf.add(plate);

    const stageTag = tag(stage.meta, stage.symbol, colorCss(stage.color), "stf");
    stageTag.element.classList.add("stf-stage");
    stageTag.position.set(-0.2, y, 0);
    stf.add(stageTag);
    wrapTerm(stageTag.element.querySelector(".tag-title") ?? stageTag.element, stage.meta, stage.term);
  }
  group.add(stf);

  const stfTag = tag("STF", "Υ(σ, B)", "#f4f1ea", "stf");
  stfTag.position.set(0, 0.14, 0);
  stf.add(stfTag);
  wrapTerm(stfTag.element.querySelector(".tag-title") ?? stfTag.element, "STF", TERMS.stf);

  const stateTag = tag("State σ", "Prior", "#5ec8e8", "block");
  stateTag.position.set(stateX + 0.07, nowBlock.y - 0.19, nowBlock.z);
  group.add(stateTag);
  wrapTerm(stateTag.element.querySelector(".tag-title") ?? stateTag.element, "state σ", TERMS.state);

  const statePostTag = tag("State σ′", "Posterior", "#7fe0ff", "block");
  statePostTag.position.set(stateX + 0.07, nowBlock.y + 0.075, nowBlock.z);
  group.add(statePostTag);
  wrapTerm(statePostTag.element.querySelector(".tag-title") ?? statePostTag.element, "state σ′", TERMS.statePost);

  const stfStateTag = tag("State σ", "Prior", "#5ec8e8", "stf");
  stfStateTag.position.set(stateX + 0.07, nowBlock.y - 0.26, nowBlock.z);
  group.add(stfStateTag);
  wrapTerm(stfStateTag.element.querySelector(".tag-title") ?? stfStateTag.element, "state σ", TERMS.state);

  const stfStatePostTag = tag("State σ′", "Posterior", "#7fe0ff", "stf");
  stfStatePostTag.position.set(stateX + 0.07, nowBlock.y, nowBlock.z);
  group.add(stfStatePostTag);
  wrapTerm(stfStatePostTag.element.querySelector(".tag-title") ?? stfStatePostTag.element, "state σ′", TERMS.statePost);

  return { group, currentBlock, blockDetail, stf, stateRail };
}
