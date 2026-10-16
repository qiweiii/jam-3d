import { BoxGeometry, Group, Mesh, TorusGeometry, Vector3 } from "three";
import { PARACHAIN_NOTES } from "./parachain-notes";
import type { ParachainPose } from "./parachain-pose";
import { CORE, HOST, READY, curve, glow, surface, type ScenePrimitives } from "./scene-primitives";
import { PARACHAIN_HEAD, parachainHeadPosition, parachainReportPaths } from "./report-paths";

type LaneOptions = {
  group: Group;
  hostState: Group;
  elements: ScenePrimitives;
  parachain: { name: string; color: number };
  index: number;
  pendingPoint: Vector3;
};

/** A candidate's complete visual lifecycle; meshes stay private to their owning lane. */
export function buildParachainLane({ group, hostState, elements, parachain, index, pendingPoint }: LaneOptions) {
  const { label, note, route } = elements;
  const { name, color } = parachain;
  const x = (index - 1) * 2.15;

  const source = new Group();
  source.position.set(x + 0.13, 3.0, 0);
  const blockGeometry = new BoxGeometry(0.25, 0.22, 0.34);
  const chainLink = new Mesh(new BoxGeometry(0.86, 0.018, 0.025), glow(color, 0.18));
  chainLink.position.set(-0.13, 0, -0.2);
  source.add(chainLink);
  for (const [i, opacity] of [0.18, 0.36].entries()) {
    const block = new Mesh(blockGeometry, glow(color, opacity));
    block.position.x = (i - 1) * 0.34 - 0.22;
    source.add(block);
  }
  const candidateSlot = new Mesh(blockGeometry, glow(color, 0.08));
  candidateSlot.position.x = 0.3;
  source.add(candidateSlot);
  group.add(source);
  const sourceTag = label(name, "Blocks", color, x, 3.52);

  const core = new Group();
  core.position.set(x, 1.55, 0);
  const coreMaterial = glow(CORE, 0.3);
  const rings = new Group();
  rings.add(new Mesh(new TorusGeometry(0.55, 0.012, 6, 64), coreMaterial));
  const orbit = new Mesh(new TorusGeometry(0.55, 0.009, 6, 64), coreMaterial);
  orbit.rotation.x = 1.08;
  rings.add(orbit);
  core.add(rings);
  // The shared pink wrapper executes parachain-specific validation code inside a child VM.
  const wrapperMaterial = surface(HOST, 0.12);
  core.add(new Mesh(new BoxGeometry(0.68, 0.43, 0.4), wrapperMaterial));
  const codeMaterial = surface(color, 0.48);
  const code = new Mesh(new BoxGeometry(0.32, 0.23, 0.14), codeMaterial);
  code.position.z = 0.27;
  core.add(code);
  group.add(core);
  const coreTag = label(`Core ${index + 1}`, "", CORE, x, 1.03);
  if (index === 0) note(coreTag, PARACHAIN_NOTES.refine);

  const collectPath = curve([
    [x + 0.43, 3, 0.2],
    [x + 0.15, 2.5, 0.25],
    [x, 1.55, 0.45],
  ]);
  const { outputPath, reportPath, releasePath, accumulatePath } = parachainReportPaths(index, x, pendingPoint);
  const collectLine = route(collectPath, color);
  const reportLine = route(reportPath, CORE);
  const accumulateLine = route(accumulatePath, color);
  const packetMaterial = glow(color);
  const packet = new Mesh(new BoxGeometry(0.24, 0.2, 0.3), packetMaterial);
  group.add(packet);
  const report = new Mesh(new BoxGeometry(0.22, 0.1, 0.22), glow(color));
  group.add(report);
  const status = new Mesh(new TorusGeometry(0.16, 0.015, 6, 40), glow(READY, 0.7));
  group.add(status);

  const headMaterial = surface(color, 0.25);
  const head = new Mesh(new BoxGeometry(0.82, 0.13, PARACHAIN_HEAD.depth), headMaterial);
  head.name = `${name} head`;
  head.position.copy(parachainHeadPosition(x));
  hostState.add(head);
  const headTag = label(name, "Host head", color, x, -2.72, head.position.z);
  hostState.add(headTag);
  const headMeta = headTag.element.querySelector(".tag-meta")!;

  return {
    update(frame: ParachainPose) {
      const { stage } = frame;
      const focused = stage >= 3;
      const written = frame.headProgress[index]!;
      source.visible = !focused;
      sourceTag.visible = !focused;
      core.visible = !focused;
      rings.rotation.set(0, frame.ringAngle, frame.ringAngle * 0.35);
      coreMaterial.opacity = stage === 2 ? 0.6 : 0.22;
      coreTag.visible = stage <= 2;
      wrapperMaterial.emissiveIntensity = stage === 2 ? 0.25 : 0.12;
      codeMaterial.emissive.set(stage === 2 ? color : CORE);
      codeMaterial.emissiveIntensity = stage === 2 ? 0.5 + frame.validation * 0.45 : 0.16;
      packet.visible = stage <= 2 && frame.reportOutput < 1;
      collectPath.getPoint(frame.candidate, packet.position);
      packetMaterial.opacity = stage === 0 ? 0.6 : stage === 2 ? 1 - frame.reportOutput : 1;
      collectLine.visible = stage === 1;
      reportLine.visible = stage === 3 && !frame.recorded;
      report.visible = (stage === 2 && frame.reportOutput > 0) || stage === 3 || (stage === 4 && written < 1);
      report.scale.setScalar(stage === 2 ? 0.35 + frame.reportOutput * 0.65 : 1);
      if (stage === 2) outputPath.getPointAt(frame.reportOutput, report.position);
      else if (stage === 4) accumulatePath.getPointAt(written, report.position);
      else if (frame.available) releasePath.getPoint(frame.released, report.position);
      else reportPath.getPoint(frame.report, report.position);
      status.position.copy(report.position);
      status.visible = stage === 3 && frame.available;
      accumulateLine.visible = stage === 4 && written > 0 && written < 1;
      headMaterial.emissiveIntensity =
        written === 1 ? (stage === 4 || (stage === 5 && index === 1) ? 0.75 : 0.48) : 0.3;
      headMeta.textContent =
        stage === 5 && index === 1 ? "Accepted head" : written === 1 ? "Head updated" : "Host head";
    },
  };
}
