import {
  AdditiveBlending,
  BoxGeometry,
  CatmullRomCurve3,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { nest, NOW_BLOCK, PVM_SHIFT_X, BLOCK_GAP, STATE_DISC_RADIUS, stateComponentPosition } from "./layout";
import { tag } from "./tag";
import type { JourneyStep, PlaybackSnapshot } from "../experience/playback";
import { journeyFrame, type JourneyFrame } from "../experience/journey-state";

const NEXT = 0xf07828;
const PURPLE = 0x7b6cff;
const GREEN = 0x69c99b;
const smooth = (t: number) => t * t * (3 - 2 * t);

export type Journey = {
  group: Group;
  /** Everything is derived from playback, including manual jumps, replay and reduced motion. */
  update: (state: PlaybackSnapshot<JourneyStep>, reduce: boolean) => JourneyFrame;
};

/** Follow one report across blocks. The moving packet, its permanent record and pending state are distinct. */
export function buildJourney(): Journey {
  const group = new Group();
  const material = (color: number) =>
    new MeshBasicMaterial({ color, blending: AdditiveBlending, transparent: true, depthWrite: false });
  const packetMat = material(NEXT);
  const packet = new Mesh(new SphereGeometry(0.026, 14, 14), packetMat);
  const packetTag = tag("Work package", "", "#f07828", "package");
  const packetTitle = packetTag.element.querySelector(".tag-title")!;
  packetTag.position.set(0, 0.09, 0);
  packet.add(packetTag);
  group.add(packet);

  // Two signature marks form before the report travels into the chain.
  const signatureMat = material(0xe8d9c5);
  const signatures = [-1, 1].map((side) => {
    const mark = new Mesh(new SphereGeometry(0.008, 8, 8), signatureMat);
    mark.position.set(side * 0.045, 0.01, 0);
    packet.add(mark);
    return mark;
  });

  const refineEnd = nest(new Vector3(1.2 + PVM_SHIFT_X, -0.55, 0.05));
  const inputPath = new CatmullRomCurve3([
    nest(new Vector3(-8.5, 0.5, 0)),
    nest(new Vector3(-4.0, 0.15, 0.1)),
    nest(new Vector3(-1.4, 0, 0)),
    nest(new Vector3(-0.4 + PVM_SHIFT_X, -0.2, 0.03)),
    nest(new Vector3(0.1 + PVM_SHIFT_X, -0.35, 0.05)),
    nest(new Vector3(0.7 + PVM_SHIFT_X, -0.55, 0.06)),
    refineEnd,
  ]);
  const blockPosition = NOW_BLOCK.clone().add(new Vector3(-0.05, 0, 0));
  const reportPath = new CatmullRomCurve3([
    refineEnd,
    nest(new Vector3(1.6, -2.0, 0.05)),
    nest(new Vector3(1.7, -4.0, 0.3)),
    blockPosition.clone().add(new Vector3(-0.2, 0.06, 0)),
    blockPosition,
  ]);

  const recorded = new Group();
  const recordStrip = new Mesh(new BoxGeometry(0.098, 0.012, 0.098), material(PURPLE));
  recordStrip.position.y = 0.05;
  const recordTag = tag("Block N", "E_G · Report included", "#a99cff", "package");
  recordTag.position.set(-0.08, -0.025, 0.01);
  recordTag.center.set(1, 0.5);
  recorded.add(recordStrip, recordTag);
  group.add(recorded);

  const later = new Group();
  later.position.copy(blockPosition);
  const assuranceStrip = new Mesh(new BoxGeometry(0.098, 0.012, 0.098), material(GREEN));
  assuranceStrip.position.y = 0.05;
  const laterTag = tag("Later block", "E_A · Assurances", "#8edab3", "package");
  laterTag.position.set(-0.08, 0.025, 0.01);
  laterTag.center.set(1, 0.5);
  later.add(assuranceStrip, laterTag);
  group.add(later);

  // Block N's rho snapshot stays pending even after later state has released the report.
  const stateEnd = stateComponentPosition("δ").add(new Vector3(0, 0, STATE_DISC_RADIUS + 0.014));
  const availablePosition = stateEnd.clone().add(new Vector3(0, 0.13, 0));
  const pending = new Group();
  const pendingMat = material(PURPLE);
  const pendingDot = new Mesh(new SphereGeometry(0.009, 12, 12), pendingMat);
  pendingDot.position.z = STATE_DISC_RADIUS + 0.008;
  const pendingRing = new Mesh(new TorusGeometry(STATE_DISC_RADIUS + 0.006, 0.003, 6, 32), pendingMat);
  pendingRing.rotation.x = Math.PI / 2;
  const pendingTag = tag("Pending report", "Awaiting data", "#a99cff", "package");
  pendingTag.position.set(0.065, 0, STATE_DISC_RADIUS + 0.008);
  pendingTag.center.set(0, 0.5);
  const pendingTitle = pendingTag.element.querySelector(".tag-title")!;
  const pendingMeta = pendingTag.element.querySelector(".tag-meta")!;
  pending.add(pendingDot, pendingRing, pendingTag);
  group.add(pending);

  // Only the released result travels toward the later block's service state.
  const available = new Group();
  const availableMat = material(GREEN);
  available.add(new Mesh(new SphereGeometry(0.014, 12, 12), availableMat));
  available.add(new Mesh(new TorusGeometry(0.025, 0.003, 6, 32), availableMat));
  const availableTag = tag("Available report", "Data assured", "#8edab3", "package");
  availableTag.position.set(0.045, 0, 0);
  availableTag.center.set(0, 0.5);
  available.add(availableTag);
  group.add(available);

  const assuranceMat = material(GREEN);
  const assuranceOrigins = Array.from({ length: 4 }, (_, i) =>
    NOW_BLOCK.clone().add(new Vector3(-0.39 - (i % 2) * 0.06, 0.12 + i * 0.1, 0.04)),
  );
  const assurances = assuranceOrigins.map((origin) => {
    const dot = new Mesh(new SphereGeometry(0.009, 8, 8), assuranceMat);
    dot.position.copy(origin);
    group.add(dot);
    return dot;
  });
  const assuranceTag = tag("Validator assurances", "Off-chain → E_A", "#8edab3", "package");
  assuranceTag.position.copy(assuranceOrigins[3]!).add(new Vector3(-0.04, 0.08, 0));
  assuranceTag.center.set(1, 0.5);
  group.add(assuranceTag);

  const stateMat = material(GREEN);
  const statePulse = new Mesh(new TorusGeometry(0.04, 0.003, 6, 32), stateMat);
  statePulse.position.copy(stateEnd);
  group.add(statePulse);
  const stateTag = tag("Service state", "Unchanged", "#b8c0c8", "package");
  stateTag.position.copy(stateEnd).add(new Vector3(0.1, -0.05, 0));
  stateTag.center.set(0, 0.5);
  const stateMeta = stateTag.element.querySelector(".tag-meta")!;
  group.add(stateTag);

  const update: Journey["update"] = ({ step, elapsed, scrubbed }, reduce) => {
    // Explicit scrubbing chooses a static pose, including with reduced motion enabled.
    const frame = journeyFrame(step, elapsed, reduce && !scrubbed);
    if (frame.path <= 0.55) inputPath.getPoint(frame.path / 0.55, packet.position);
    else reportPath.getPoint((frame.path - 0.55) / 0.45, packet.position);
    packetMat.color.set(frame.report ? PURPLE : NEXT);
    packetMat.opacity = frame.packetOpacity;
    packet.scale.setScalar(0.3 + frame.packetOpacity * 0.7);
    packet.visible = frame.packetOpacity > 0.001;
    packetTitle.textContent = frame.report ? (frame.signed === 1 ? "Signed report" : "Work report") : "Work package";
    packetTag.element.style.setProperty("--tag", frame.report ? "#a99cff" : "#f07828");
    for (const [i, signature] of signatures.entries()) {
      const amount = Math.max(0, Math.min(1, frame.signed * 2 - i));
      signature.visible = frame.report && amount > 0;
      signature.scale.setScalar(amount);
    }
    signatureMat.opacity = frame.packetOpacity;

    recorded.visible = frame.recorded;
    recorded.position.copy(blockPosition);
    recorded.position.y -= smooth(frame.blockAdvance) * BLOCK_GAP;
    later.visible = frame.blockAdvance === 1;
    assuranceStrip.visible = frame.available;

    pending.position.copy(stateComponentPosition("ρ", smooth(frame.blockAdvance)));
    pending.visible = frame.recorded;
    pendingMat.opacity = frame.available ? 0.55 : frame.pendingOpacity;
    pendingTag.element.style.opacity = String(pendingMat.opacity);
    pendingTitle.textContent = frame.available ? "Pending at N" : "Pending report";
    pendingMeta.textContent = frame.available ? "Historical state" : "Awaiting data";

    available.position.lerpVectors(pending.position, availablePosition, smooth(frame.release));
    available.position.lerp(stateEnd, smooth(frame.accumulation));
    available.visible = frame.available && frame.pendingOpacity > 0.001;
    availableMat.opacity = frame.pendingOpacity;
    availableTag.element.style.opacity = String(frame.pendingOpacity);
    availableTag.visible = frame.release > 0.65 && frame.accumulation < 0.2;

    for (const [i, dot] of assurances.entries()) {
      const progress = Math.max(0, Math.min(1, frame.assurance * 1.6 - i * 0.2));
      dot.visible = step.id === "availability" && frame.blockAdvance === 1 && progress < 1;
      dot.position.lerpVectors(assuranceOrigins[i]!, blockPosition, smooth(progress));
    }
    assuranceTag.visible = step.id === "availability" && frame.phase === "assure";
    stateTag.visible = frame.blockAdvance === 1;
    stateMeta.textContent =
      frame.phase === "applied" ? "Results applied" : frame.accumulation > 0 ? "Updating" : "Unchanged";
    stateTag.element.style.setProperty("--tag", frame.accumulation > 0 ? "#8edab3" : "#b8c0c8");
    statePulse.visible = frame.accumulation > 0 && frame.accumulation < 1;
    statePulse.scale.setScalar(0.8 + frame.accumulation * 1.6);
    stateMat.opacity = Math.sin(frame.accumulation * Math.PI) * 0.8;
    return frame;
  };

  return { group, update };
}
