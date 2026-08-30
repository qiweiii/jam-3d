import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
} from "three";
import { BLOCK_GAP, NOW_BLOCK } from "../lod";
import { makeCurve } from "./streams";
import { tag } from "./tag";

export type Chain = {
  group: Group;
  stf: Group;
};

/** The block chain: recent blocks, connector line, STF stack in the block-to-block gap. */
export function buildChain(): Chain {
  const group = new Group();

  const blockCount = 10;
  const nowBlock = NOW_BLOCK.clone();
  const blockGap = BLOCK_GAP;
  const oldestY = nowBlock.y - (blockCount - 1) * blockGap;
  const blockGeom = new BoxGeometry(0.15, 0.15, 0.15);
  const blocks: Mesh[] = [];
  for (let i = 0; i < blockCount; i++) {
    const m = new Mesh(
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
    m.position.set(nowBlock.x, nowBlock.y - i * blockGap, nowBlock.z);
    m.scale.setScalar(1 - i * 0.04);
    group.add(m);
    blocks.push(m);
  }
  const thisBlock = blocks[0];
  if (thisBlock) {
    const mat = thisBlock.material;
    if (mat instanceof MeshStandardMaterial) {
      mat.emissive = new Color(0xf0a03c);
      mat.emissiveIntensity = 0.9;
      mat.color.set(0x2a2214);
      mat.opacity = 1;
    }
  }
  group.add(
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
  const plateGeom = new BoxGeometry(0.32, 0.04, 0.22);
  for (let i = 0; i < 5; i++) {
    const plate = new Mesh(
      plateGeom,
      new MeshStandardMaterial({
        color: 0x14161c,
        emissive: 0x3a4a58,
        emissiveIntensity: 0.3 + i * 0.07,
        roughness: 0.42,
        metalness: 0.22,
      }),
    );
    plate.position.y = (i - 2) * 0.06;
    stf.add(plate);
  }
  group.add(stf);

  const rootTag = tag("state root", "header commit", "#f4f1ea", "block");
  if (thisBlock) rootTag.position.copy(thisBlock.position).add(new Vector3(0.3, 0, 0));
  group.add(rootTag);
  const stfTag = tag("STF", "σ → σ′", "#9ec8dc", "stf");
  stfTag.position.set(0.55, 0, 0);
  stf.add(stfTag);

  return { group, stf };
}
