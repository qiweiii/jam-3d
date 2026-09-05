import { AdditiveBlending, CatmullRomCurve3, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";
import { nest, NOW_BLOCK, PVM_SHIFT_X } from "./layout";
import { tag } from "./tag";
import type { JourneyStep, PlaybackSnapshot } from "../experience/playback";

const NEXT = 0xf07828;
const PURPLE = 0x7b6cff;
const PATH_STEPS = {
  package: [0, 0.22],
  authorize: [0.22, 0.22],
  refine: [0.22, 0.55],
  guarantee: [0.55, 13 / 14],
  availability: [13 / 14, 13 / 14],
  accumulate: [13 / 14, 1],
} as const;

export type Journey = {
  packet: Mesh;
  /** Render the explicit playback state; layout never determines protocol state. */
  update: (state: PlaybackSnapshot<JourneyStep>, reduce: boolean) => void;
};

/** One work package riding the core: approach, refine, then report sprinting to the block. */
export function buildJourney(): Journey {
  const wpMat = new MeshBasicMaterial({ color: NEXT, blending: AdditiveBlending });
  const wpPacket = new Mesh(new SphereGeometry(0.026, 14, 14), wpMat);
  const wpTag = tag("Work package", "", "#f07828", ["package", "block"]);
  let wpIsReport = false;
  wpTag.position.set(0, 0.12, 0);
  wpPacket.add(wpTag);
  const nowBlock = NOW_BLOCK.clone();
  const stateEnd = new Vector3(nowBlock.x + 0.05, nowBlock.y, nowBlock.z);
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
      new Vector3(nowBlock.x + 0.05, nowBlock.y, nowBlock.z),
    ],
    false,
    "catmullrom",
    0.4,
  );
  wpPath.getPointAt(0, wpPacket.position);

  const update: Journey["update"] = ({ step, elapsed }, reduce) => {
    const progress = reduce ? 1 : Math.min(1, elapsed / step.duration);
    const [from, to] = PATH_STEPS[step.id];
    const u = from + (to - from) * progress;
    wpPath.getPoint(u, wpPacket.position);
    wpTag.visible = wpPacket.position.distanceTo(stateEnd) > 0.03;
    const report = step.report;
    if (report !== wpIsReport) {
      wpIsReport = report;
      wpMat.color.set(report ? PURPLE : NEXT);
      wpTag.element.innerHTML = `<span class="tag-title">${report ? "Work report" : "Work package"}</span>`;
      wpTag.element.style.setProperty("--tag", report ? "#7b6cff" : "#f07828");
    }
  };

  return { packet: wpPacket, update };
}
