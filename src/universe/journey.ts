import { AdditiveBlending, CatmullRomCurve3, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";
import { nest, NOW_BLOCK } from "../lod";
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
  const wpPacket = new Mesh(new SphereGeometry(0.055, 14, 14), wpMat);
  const wpTag = tag("work package", "", "#f07828", ["package", "block"]);
  let wpIsReport = false;
  wpTag.position.set(0, 0.2, 0);
  wpPacket.add(wpTag);
  const nowBlock = NOW_BLOCK.clone();
  const wpPath = new CatmullRomCurve3(
    [
      nest(new Vector3(-8.5, 0.5, 0)),
      nest(new Vector3(-4.0, 0.15, 0.1)),
      nest(new Vector3(-1.4, 0, 0)),
      nest(new Vector3(0.2, 0, 0)),
      nest(new Vector3(1.8, 0.08, 0.1)),
      nest(new Vector3(2.6, 0.12, 0.15)),
      nest(new Vector3(4.5, -1.6, 0.3)),
      new Vector3(nowBlock.x, nowBlock.y + 0.85, nowBlock.z),
      nowBlock.clone(),
    ],
    false,
    "catmullrom",
    0.4,
  );
  wpPath.getPointAt(0, wpPacket.position);

  const update = (t: number) => {
    // lap rate 0.2: in-core slope 0.7 keeps today's 0.14 pace, post-core slope 1.45 doubles it
    const lap = (t * 0.2) % 1;
    const u = lap < 0.6 ? lap * 0.7 : 0.42 + (lap - 0.6) * 1.45;
    wpPath.getPointAt(u, wpPacket.position);
    // past the kidney tail (u≈0.2275 of arc length) refine is done: package became a report
    const report = u > 0.225;
    if (report !== wpIsReport) {
      wpIsReport = report;
      wpMat.color.set(report ? PURPLE : NEXT);
      wpTag.element.innerHTML = `<span class="tag-title">${report ? "work report" : "work package"}</span>`;
      wpTag.element.style.setProperty("--tag", report ? "#7b6cff" : "#f07828");
    }
  };

  return { packet: wpPacket, update };
}
