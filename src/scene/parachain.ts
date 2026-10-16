import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  EdgesGeometry,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { PARACHAIN_TERMS } from "../content/parachain";
import { type ParachainFrame, parachainPhase } from "../experience/parachain-state";
import { attachBubble } from "../ui/bubble";
import { buildStateCylinder } from "./state-cylinder";
import { PARACHAIN_HEAD, parachainHeadPosition, parachainReportPaths } from "./parachain-paths";
import { tag } from "./tag";

const HOST = 0xc87999;
const CORE = 0x8c9cab;
const PROTOCOL = 0x827da8;
const READY = 0x8dceae;
const PARAS = [
  { name: "Asset Hub", color: 0x75bfd4 },
  { name: "Coretime", color: 0xd5b66e },
  { name: "Parachain A", color: 0x88c4aa },
] as const;

/** One host, independent candidates. Colour follows a parachain's data, not ownership of a core. */
export function buildParachain(onInspect: () => void) {
  const group = new Group();
  group.position.set(-46, 0, 0);
  group.visible = false;
  const glow = (color: number, opacity = 1) =>
    new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  const surface = (color: number, strength = 0.3) =>
    new MeshStandardMaterial({
      color: 0x11151b,
      emissive: color,
      emissiveIntensity: strength,
      roughness: 0.5,
      metalness: 0.2,
    });
  // CSS2D labels render over the scene; lifting them toward the camera causes visible parallax.
  const label = (title: string, meta: string, color: number, x: number, y: number, z = 0) => {
    const pin = tag(title, meta, `#${color.toString(16).padStart(6, "0")}`, "parachain");
    pin.position.set(x, y, z);
    group.add(pin);
    return pin;
  };
  const inspect = (
    element: HTMLElement,
    spec: (typeof PARACHAIN_TERMS)[keyof typeof PARACHAIN_TERMS],
    title?: string,
  ) => {
    attachBubble(element, spec, title);
    element.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") onInspect();
    });
    element.addEventListener("focus", onInspect);
    element.addEventListener("click", onInspect);
  };
  const note = (pin: ReturnType<typeof label>, spec: (typeof PARACHAIN_TERMS)[keyof typeof PARACHAIN_TERMS]) =>
    inspect(pin.element.querySelector<HTMLElement>(".tag-title")!, spec);
  const curve = (points: number[][]) => new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
  const route = (path: CatmullRomCurve3, color: number) => {
    const material = glow(color, 0.22);
    const mesh = new Mesh(new TubeGeometry(path, 32, 0.009, 6, false), material);
    group.add(mesh);
    return mesh;
  };
  const rim = (geometry: BoxGeometry, color: number, position: Vector3, opacity = 0.35) => {
    const mesh = new LineSegments(
      new EdgesGeometry(geometry),
      new LineBasicMaterial({ color, transparent: true, opacity }),
    );
    mesh.position.copy(position);
    group.add(mesh);
    return mesh;
  };
  const bar = (width: number, radius: number, y: number, color: number) => {
    const material = surface(color, 0.2);
    const mesh = new Mesh(new CapsuleGeometry(radius, width - radius * 2, 6, 48), material);
    mesh.rotation.z = Math.PI / 2;
    mesh.position.y = y;
    group.add(mesh);
    return mesh;
  };

  // The protocol rail stays separate from the service's single state enclosure.
  const protocol = bar(6.55, 0.26, -0.15, PROTOCOL);
  const protocolTag = label("JAM protocol", "", PROTOCOL, 0, -0.15);
  const state = buildStateCylinder();
  state.group.position.set(2.5, 1.1, 0);
  group.add(state.group);
  const pendingPoint = state.point("ρ").add(state.group.position);
  const servicePoint = state.point("δ").add(state.group.position);
  const queuePoint = state.point("φ").add(state.group.position);
  queuePoint.x -= state.radius;
  queuePoint.z = 0.2;
  const stateTitle = label("JAM state · σ", "", CORE, 2.5, 2.8);
  const stateTags = [
    label("Pending reports · ρ", "", 0x8c7cff, 1.25, pendingPoint.y, 0.2),
    label("Service accounts · δ", "", HOST, 1.25, servicePoint.y, 0.2),
    label("Authorizer queues · φ", "", 0xf07828, 1.25, queuePoint.y, 0.2),
  ];
  const layerLeaders = [pendingPoint, servicePoint, queuePoint].map((point, index) => {
    const pin = stateTags[index]!;
    pin.center.set(1, 0.5);
    pin.element.classList.add("parachain-state-layer");
    return route(
      curve([
        [1.32, point.y, 0.2],
        [2.5 - state.radius, point.y, 0.2],
      ]),
      [0x8c7cff, HOST, 0xf07828][index]!,
    );
  });
  note(stateTags[0]!, PARACHAIN_TERMS.availability);
  note(stateTags[2]!, PARACHAIN_TERMS.coretime);
  const phaseTag = label("Signed work-reports", "JAM block N", CORE, -1.95, 2.8);
  const phaseTitle = phaseTag.element.querySelector(".tag-title")!;
  const phaseMeta = phaseTag.element.querySelector(".tag-meta")!;
  const readyTag = label("Ready reports", "", READY, -1.95, 0.45);
  const hostState = new Group();
  hostState.name = "Parachain Service state";
  group.add(hostState);
  const hostTag = label("Parachain Service", "Host records", HOST, 0, -1.6);
  hostState.add(hostTag);
  note(hostTag, PARACHAIN_TERMS.accumulate);
  inspect(hostTag.element.querySelector<HTMLElement>(".tag-meta")!, PARACHAIN_TERMS.host, "Host records");
  const hostMaterial = glow(HOST, 0.035);
  const hostGeometry = new BoxGeometry(6.55, 1.65, 1.1);
  const enclosure = new Mesh(hostGeometry, hostMaterial);
  enclosure.position.set(0, -2.155, -0.05);
  const hostRim = rim(hostGeometry, HOST, enclosure.position, 0.3);
  hostState.add(enclosure, hostRim);
  // A dashed, non-directional callout identifies the box as a detail of δ, not another state store.
  const storageDetail = new Line(
    new BufferGeometry().setFromPoints([
      new Vector3(2.5 + state.radius, servicePoint.y, 0.2),
      new Vector3(3.6, servicePoint.y, 0.2),
      new Vector3(3.6, -1.6, 0.2),
      new Vector3(3.275, -1.6, 0.2),
    ]),
    new LineDashedMaterial({ color: HOST, dashSize: 0.07, gapSize: 0.06, transparent: true, opacity: 0.35 }),
  );
  storageDetail.computeLineDistances();
  group.add(storageDetail);

  const lanes = PARAS.map((para, index) => {
    const x = (index - 1) * 2.15;
    const source = new Group();
    source.position.set(x + 0.13, 3.0, 0);
    const blockGeometry = new BoxGeometry(0.25, 0.22, 0.34);
    const chainLink = new Mesh(new BoxGeometry(0.86, 0.018, 0.025), glow(para.color, 0.18));
    chainLink.position.set(-0.13, 0, -0.2);
    source.add(chainLink);
    for (const [i, opacity] of [0.18, 0.36].entries()) {
      const block = new Mesh(blockGeometry, glow(para.color, opacity));
      block.position.x = (i - 1) * 0.34 - 0.22;
      source.add(block);
    }
    const candidateSlot = new Mesh(blockGeometry, glow(para.color, 0.08));
    candidateSlot.position.x = 0.3;
    source.add(candidateSlot);
    group.add(source);
    const sourceTag = label(para.name, "Blocks", para.color, x, 3.52);

    const core = new Group();
    core.position.set(x, 1.55, 0);
    const coreMat = glow(CORE, 0.3);
    const rings = new Group();
    rings.add(new Mesh(new TorusGeometry(0.55, 0.012, 6, 64), coreMat));
    const orbit = new Mesh(new TorusGeometry(0.55, 0.009, 6, 64), coreMat);
    orbit.rotation.x = 1.08;
    rings.add(orbit);
    core.add(rings);
    // The shared pink wrapper executes parachain-specific validation code inside a child VM.
    const wrapperMat = surface(HOST, 0.12);
    const wrapper = new Mesh(new BoxGeometry(0.68, 0.43, 0.4), wrapperMat);
    core.add(wrapper);
    const codeMat = surface(para.color, 0.48);
    const code = new Mesh(new BoxGeometry(0.32, 0.23, 0.14), codeMat);
    code.position.z = 0.27;
    core.add(code);
    group.add(core);
    const coreTag = label(`Core ${index + 1}`, "", CORE, x, 1.03);
    if (index === 0) note(coreTag, PARACHAIN_TERMS.refine);

    const collectPath = curve([
      [x + 0.43, 3, 0.2],
      [x + 0.15, 2.5, 0.25],
      [x, 1.55, 0.45],
    ]);
    const { outputPath, reportPath, releasePath, accumulatePath } = parachainReportPaths(index, x, pendingPoint);
    const collectLine = route(collectPath, para.color);
    const reportLine = route(reportPath, CORE);
    const accumulateLine = route(accumulatePath, para.color);
    const packetMat = glow(para.color);
    const packet = new Mesh(new BoxGeometry(0.24, 0.2, 0.3), packetMat);
    group.add(packet);
    const report = new Mesh(new BoxGeometry(0.22, 0.1, 0.22), glow(para.color));
    group.add(report);
    const statusMat = glow(READY, 0.7);
    const status = new Mesh(new TorusGeometry(0.16, 0.015, 6, 40), statusMat);
    group.add(status);

    const headGeometry = new BoxGeometry(0.82, 0.13, PARACHAIN_HEAD.depth);
    const headMat = surface(para.color, 0.25);
    const head = new Mesh(headGeometry, headMat);
    head.name = `${para.name} head`;
    head.position.copy(parachainHeadPosition(x));
    hostState.add(head);
    const headTag = label(para.name, "Host head", para.color, x, -2.72, head.position.z);
    hostState.add(headTag);
    const headMeta = headTag.element.querySelector(".tag-meta")!;
    return {
      source,
      sourceTag,
      core,
      rings,
      coreMat,
      coreTag,
      wrapperMat,
      codeMat,
      packet,
      packetMat,
      report,
      status,
      collectPath,
      outputPath,
      reportPath,
      releasePath,
      accumulatePath,
      collectLine,
      reportLine,
      accumulateLine,
      headMat,
      headMeta,
    };
  });

  // The accepted Coretime result updates φ in JAM state, not an already-used core.
  const assignmentStart = parachainHeadPosition(0).add(new Vector3(0.3, 0.065, PARACHAIN_HEAD.depth / 2));
  const assignmentPath = curve([
    assignmentStart.toArray(),
    [1.05, -1.85, 0.8],
    [1.35, -0.25, 0.65],
    queuePoint.toArray(),
  ]);
  const assignmentLine = route(assignmentPath, PARAS[1].color);
  const assignment = new Mesh(new BoxGeometry(0.15, 0.15, 0.15), glow(PARAS[1].color));
  group.add(assignment);

  const update = (frame: ParachainFrame) => {
    const { stage } = frame;
    const focused = stage >= 3;
    protocol.visible = !focused;
    protocolTag.visible = !focused;
    state.group.visible = focused;
    stateTitle.visible = focused;
    storageDetail.visible = focused;
    for (const [index, pin] of stateTags.entries()) {
      pin.visible = stage === index + 3;
      layerLeaders[index]!.visible = pin.visible;
    }
    if (frame.stateLayer) {
      const intensity =
        stage === 3
          ? frame.recorded && !frame.available
            ? 1.2
            : 0.35
          : stage === 4
            ? 0.45 + frame.heads * 0.75
            : frame.assignment === 1
              ? 1.3
              : 0.4;
      state.highlight(frame.stateLayer, intensity);
      const serviceLayer = state.layers.find((layer) => layer.name === "δ")!;
      serviceLayer.material.emissiveIntensity = Math.max(0.3, serviceLayer.material.emissiveIntensity);
    }
    phaseTag.visible = stage === 3;
    const phase = parachainPhase(frame);
    phaseTitle.textContent = phase.title;
    phaseMeta.textContent = phase.meta;
    readyTag.visible = (stage === 3 && frame.available) || stage === 4;
    hostMaterial.opacity = stage === 4 ? 0.065 : 0.035;
    hostRim.material.opacity = stage === 4 ? 0.5 : 0.3;
    for (const [index, lane] of lanes.entries()) {
      const written = frame.headProgress[index]!;
      lane.source.visible = !focused;
      lane.sourceTag.visible = !focused;
      lane.core.visible = !focused;
      lane.rings.rotation.set(0, frame.ringAngle, frame.ringAngle * 0.35);
      lane.coreMat.opacity = stage === 2 ? 0.6 : 0.22;
      lane.coreTag.visible = stage <= 2;
      lane.wrapperMat.emissiveIntensity = stage === 2 ? 0.25 : 0.12;
      lane.codeMat.emissive.set(stage === 2 ? PARAS[index]!.color : CORE);
      lane.codeMat.emissiveIntensity = stage === 2 ? 0.5 + frame.validation * 0.45 : 0.16;
      lane.packet.visible = stage <= 2 && frame.reportOutput < 1;
      lane.collectPath.getPoint(frame.candidate, lane.packet.position);
      lane.packetMat.opacity = stage === 0 ? 0.6 : stage === 2 ? 1 - frame.reportOutput : 1;
      lane.collectLine.visible = stage === 1;
      lane.reportLine.visible = stage === 3 && !frame.recorded;
      lane.report.visible = (stage === 2 && frame.reportOutput > 0) || stage === 3 || (stage === 4 && written < 1);
      lane.report.scale.setScalar(stage === 2 ? 0.35 + frame.reportOutput * 0.65 : 1);
      if (stage === 2) {
        lane.outputPath.getPointAt(frame.reportOutput, lane.report.position);
      } else if (stage === 4) {
        lane.accumulatePath.getPointAt(written, lane.report.position);
      } else if (frame.available) lane.releasePath.getPoint(frame.released, lane.report.position);
      else lane.reportPath.getPoint(frame.report, lane.report.position);
      lane.status.position.copy(lane.report.position);
      lane.status.visible = stage === 3 && frame.available;
      lane.accumulateLine.visible = stage === 4 && written > 0 && written < 1;
      lane.headMat.emissiveIntensity =
        written === 1 ? (stage === 4 || (stage === 5 && index === 1) ? 0.75 : 0.48) : 0.3;
      lane.headMeta.textContent =
        stage === 5 && index === 1 ? "Accepted head" : written === 1 ? "Head updated" : "Host head";
    }
    assignmentLine.visible = stage === 5;
    assignmentLine.material.opacity = frame.assignment === 1 ? 0.12 : 0.3;
    assignment.visible = stage === 5 && frame.assignment > 0;
    assignmentPath.getPoint(frame.assignment, assignment.position);
  };

  const resize = (width: number, height: number) => {
    const landscape = width < 1024 && height < 500 && width > height;
    group.scale.setScalar(landscape ? 0.8 : 1);
    group.position.x = -46 + (landscape ? 1.5 : 0);
    // Lift the illustration together; shorter phones need extra clearance above the caption.
    group.position.y = 0.3 + (width < 600 && height > width ? 0.7 + Math.max(0, (760 - height) * 0.014) : 0);
  };
  return { group, update, resize };
}
