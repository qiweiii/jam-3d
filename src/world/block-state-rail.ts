import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TubeGeometry,
} from "three";
import { JAM_STATE_COMPONENTS, STATE_SOURCE } from "../content/jam-state";
import { makeCurve } from "../graphics/curves";
import { createSceneLabel } from "../graphics/scene-label";
import { wrapTerm } from "../ui/term-bubble";
import {
  BLOCK_GAP,
  NOW_BLOCK,
  CHAIN_RAIL_OFFSET,
  STATE_DISC_RADIUS,
  STATE_DISC_HEIGHT,
  stateComponentY,
} from "./layout";

/** Presentation input; shared geometry does not depend on a particular tour's state type. */
export type BlockRailPose = { advance: number; pendingRecorded: boolean; accumulation: number };

/** Twin rails reused by the Package tour and the static Block/STF views. */
export function buildBlockStateRail() {
  const group = new Group();
  const blocks = new Group();
  group.add(blocks);
  const blockCount = 10;
  const nowBlock = NOW_BLOCK.clone();
  const blockX = nowBlock.x - CHAIN_RAIL_OFFSET;
  const stateX = nowBlock.x + CHAIN_RAIL_OFFSET;
  const blockGap = BLOCK_GAP;
  const oldestY = nowBlock.y - (blockCount - 1) * blockGap;
  const blockGeometry = new BoxGeometry(0.09, 0.09, 0.09);
  const currentBlock = new Mesh(
    blockGeometry,
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
  const historyBlocks = [currentBlock];
  for (let i = 1; i < blockCount; i++) {
    const block = new Mesh(
      blockGeometry,
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
    historyBlocks.push(block);
  }
  const laterBlockMaterial = currentBlock.material.clone();
  laterBlockMaterial.transparent = true;
  const laterBlock = new Mesh(blockGeometry, laterBlockMaterial);
  laterBlock.position.copy(currentBlock.position);
  laterBlock.visible = false;
  blocks.add(laterBlock);

  const stateRail = new Group();
  const historyStates: Group[] = [];
  const discGeometry = new CylinderGeometry(STATE_DISC_RADIUS, STATE_DISC_RADIUS, STATE_DISC_HEIGHT, 20);
  for (let i = 0; i < blockCount; i++) {
    const state = new Group();
    const fresh = i === 0;
    for (const component of JAM_STATE_COMPONENTS) {
      const disc = new Mesh(
        discGeometry,
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
      disc.name = component.symbol;
      disc.position.y = stateComponentY(component.symbol);
      state.add(disc);
      if (fresh) {
        const text = `${component.symbol}′ · ${component.name}`;
        const label = createSceneLabel(text, "", "#e8e6e0", "block");
        label.element.classList.add("state-symbol");
        label.position.set(0.07, disc.position.y, 0.039);
        wrapTerm(
          label.element,
          text,
          {
            side: "right",
            bullets: [{ text: component.note }, { text: "Gray Paper 0.8.0 · §4.2 state", href: STATE_SOURCE }],
          },
          text,
        );
        state.add(label);
      }
    }
    state.position.set(stateX, nowBlock.y - i * blockGap, nowBlock.z);
    state.scale.setScalar(1 - i * 0.04);
    stateRail.add(state);
    historyStates.push(state);
  }
  const laterState = new Group();
  laterState.position.set(stateX, nowBlock.y, nowBlock.z);
  const laterDiscs: Mesh<typeof discGeometry, MeshStandardMaterial>[] = [];
  for (const child of historyStates[0]!.children) {
    if (!(child instanceof Mesh)) continue;
    const material = (child.material as MeshStandardMaterial).clone();
    const disc = new Mesh(discGeometry, material);
    disc.name = child.name;
    disc.position.copy(child.position);
    laterState.add(disc);
    laterDiscs.push(disc);
  }
  laterState.visible = false;
  stateRail.add(laterState);
  group.add(stateRail);
  const pendingDisc = historyStates[0]!.getObjectByName("ρ") as Mesh<typeof discGeometry, MeshStandardMaterial>;
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

  return {
    group,
    setCurrentBlockVisible(visible: boolean) {
      currentBlock.visible = visible;
    },
    updatePose(pose: BlockRailPose | null) {
      const advance = pose?.advance ?? 0;
      const eased = advance * advance * (3 - 2 * advance);
      for (const [i, block] of historyBlocks.entries()) block.position.y = nowBlock.y - (i + eased) * blockGap;
      for (const [i, state] of historyStates.entries()) state.position.y = nowBlock.y - (i + eased) * blockGap;
      currentBlock.material.emissiveIntensity = 0.9 - eased * 0.55;
      pendingDisc.material.emissiveIntensity = pose?.pendingRecorded ? 1.6 : 0.55;
      laterBlock.visible = advance > 0;
      laterBlockMaterial.opacity = eased;
      laterBlock.scale.setScalar(0.6 + 0.4 * eased);
      laterState.visible = advance > 0;
      for (const disc of laterDiscs) {
        disc.material.opacity = eased;
        disc.material.emissiveIntensity = 0.55 + (disc.name === "δ" ? (pose?.accumulation ?? 0) * 2 : 0);
      }
    },
  };
}
