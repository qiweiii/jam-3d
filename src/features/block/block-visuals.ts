import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { BLOCK_GAP, NOW_BLOCK, CHAIN_RAIL_OFFSET } from "../../world/layout";
import { buildBlockStateRail } from "../../world/block-state-rail";
import { wrapTerm } from "../../ui/term-bubble";
import { createSceneLabel } from "../../graphics/scene-label";
import { JAM_STATE_NOTES } from "../../content/jam-state-notes";
import { BLOCK_NOTES } from "./block-notes";
import { BLOCK_EXTRINSICS } from "./block-extrinsics";
import { STF_OPERATIONS } from "./stf-operations";

/** Block and STF detail share the same physical rails as the Package tour. */
export function buildBlockVisuals() {
  const rail = buildBlockStateRail();
  const { group } = rail;
  const nowBlock = NOW_BLOCK.clone();
  const blockX = nowBlock.x - CHAIN_RAIL_OFFSET;
  const stateX = nowBlock.x + CHAIN_RAIL_OFFSET;
  const blockGap = BLOCK_GAP;

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
  const headerTag = createSceneLabel("Header · H", "", "#e8b35d", ["block", "stf"]);
  headerTag.position.set(blockX - 0.09, nowBlock.y + headerY, nowBlock.z);
  group.add(headerTag);
  wrapTerm(headerTag.element.querySelector(".tag-title") ?? headerTag.element, "header", BLOCK_NOTES.blockHeader);

  for (const [i, part] of BLOCK_EXTRINSICS.entries()) {
    const partTag = createSceneLabel(`${part.title} · ${part.meta}`, "", colorCss(part.color), ["block", "stf"]);
    partTag.position.set(blockX - 0.09, nowBlock.y + extrinsicYs[i]!, nowBlock.z);
    group.add(partTag);
    wrapTerm(partTag.element.querySelector(".tag-title") ?? partTag.element, part.title, part.term);
  }

  const stf = new Group();
  stf.position.set(stateX, nowBlock.y - blockGap / 2, nowBlock.z);
  stf.scale.setScalar(0.34);
  const plateGeom = new BoxGeometry(0.18, 0.014, 0.11);
  const stageGap = 0.022;
  for (const [i, stage] of STF_OPERATIONS.entries()) {
    const y = ((STF_OPERATIONS.length - 1) / 2 - i) * stageGap;
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

    const stageTag = createSceneLabel(stage.meta, stage.symbol, colorCss(stage.color), "stf");
    stageTag.element.classList.add("stf-stage");
    stageTag.position.set(-0.2, y, 0);
    stf.add(stageTag);
    wrapTerm(
      stageTag.element.querySelector(".tag-title") ?? stageTag.element,
      stage.meta,
      stage.term,
      `${stage.title} · ${stage.meta}`,
    );
  }
  group.add(stf);

  const stfTag = createSceneLabel("STF", "Υ(σ, B)", "#f4f1ea", "stf");
  stfTag.position.set(0, 0.14, 0);
  stf.add(stfTag);
  wrapTerm(stfTag.element.querySelector(".tag-title") ?? stfTag.element, "STF", BLOCK_NOTES.stf);

  const stateTag = createSceneLabel("State σ", "Prior", "#5ec8e8", "block");
  stateTag.position.set(stateX + 0.07, nowBlock.y - 0.19, nowBlock.z);
  group.add(stateTag);
  wrapTerm(stateTag.element.querySelector(".tag-title") ?? stateTag.element, "state σ", JAM_STATE_NOTES.state);

  const statePostTag = createSceneLabel("State σ′", "Posterior", "#7fe0ff", "block");
  statePostTag.position.set(stateX + 0.07, nowBlock.y + 0.075, nowBlock.z);
  group.add(statePostTag);
  wrapTerm(
    statePostTag.element.querySelector(".tag-title") ?? statePostTag.element,
    "state σ′",
    JAM_STATE_NOTES.statePost,
  );

  const stfStateTag = createSceneLabel("State σ", "Prior", "#5ec8e8", "stf");
  stfStateTag.position.set(stateX + 0.07, nowBlock.y - 0.26, nowBlock.z);
  group.add(stfStateTag);
  wrapTerm(stfStateTag.element.querySelector(".tag-title") ?? stfStateTag.element, "state σ", JAM_STATE_NOTES.state);

  const stfStatePostTag = createSceneLabel("State σ′", "Posterior", "#7fe0ff", "stf");
  stfStatePostTag.position.set(stateX + 0.07, nowBlock.y, nowBlock.z);
  group.add(stfStatePostTag);
  wrapTerm(
    stfStatePostTag.element.querySelector(".tag-title") ?? stfStatePostTag.element,
    "state σ′",
    JAM_STATE_NOTES.statePost,
  );

  return {
    group,
    updateRail: rail.updatePose,
    setFocus(view: "block" | "stf" | null) {
      stf.visible = view === "stf";
      rail.setCurrentBlockVisible(view === null);
      blockDetail.visible = view !== null;
    },
  };
}
