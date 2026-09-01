import { AdditiveBlending, CatmullRomCurve3, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";
import { HERO, INNER, nest, NOW_BLOCK, PVM_SHIFT_X } from "../lod";
import { tag } from "./tag";

const NEXT = 0xf07828;
const PURPLE = 0x7b6cff;

export type Journey = {
  packet: Mesh;
  /** Advance the journey; `t` is seconds. No-op under reduced motion if never called. */
  update: (t: number) => void;
};

/** One work package riding the core: approach, refine, then report sprinting to the block. */
export function buildJourney(): Journey {
  const wpMat = new MeshBasicMaterial({ color: NEXT, blending: AdditiveBlending });
  const wpPacket = new Mesh(new SphereGeometry(0.026, 14, 14), wpMat);
  const wpTag = tag("work package", "", "#f07828", ["package", "block"]);
  let wpIsReport = false;
  wpTag.position.set(0, 0.12, 0);
  wpPacket.add(wpTag);
  const nowBlock = NOW_BLOCK.clone();
  const wpPath = new CatmullRomCurve3(
    [
      nest(new Vector3(-8.5, 0.5, 0)),
      nest(new Vector3(-4.0, 0.15, 0.1)),
      nest(new Vector3(-1.4, 0, 0)),
      nest(new Vector3(-0.4 + PVM_SHIFT_X, -0.2, 0.03)),
      nest(new Vector3(0.1 + PVM_SHIFT_X, -0.35, 0.05)),
      nest(new Vector3(0.7 + PVM_SHIFT_X, -0.55, 0.06)),
      nest(new Vector3(1.3 + PVM_SHIFT_X, -0.72, 0.05)),
      nest(new Vector3(1.6 + PVM_SHIFT_X, -0.82, 0.08)),
      nest(new Vector3(2.2 + PVM_SHIFT_X, -1.0, 0.12)),
      nest(new Vector3(3.2, -1.6, 0.2)),
      nest(new Vector3(4.3, -3.5, 0.45)),
      nest(new Vector3(5.0, -5.8, 0.75)),
      new Vector3(nowBlock.x - 0.05, nowBlock.y + 0.08, nowBlock.z),
      new Vector3(nowBlock.x - 0.05, nowBlock.y, nowBlock.z),
    ],
    false,
    "catmullrom",
    0.4,
  );
  wpPath.getPointAt(0, wpPacket.position);

  const update = (t: number) => {
    // getPointAt is arc-length based: approach and post-core travel at the same speed.
    const u = (t * 0.2) % 1;
    wpPath.getPointAt(u, wpPacket.position);
    const report = wpPacket.position.x > HERO.x + (1.45 + PVM_SHIFT_X) * INNER;
    if (report !== wpIsReport) {
      wpIsReport = report;
      wpMat.color.set(report ? PURPLE : NEXT);
      wpTag.element.innerHTML = `<span class="tag-title">${report ? "work report" : "work package"}</span>`;
      wpTag.element.style.setProperty("--tag", report ? "#7b6cff" : "#f07828");
    }
  };

  return { packet: wpPacket, update };
}
