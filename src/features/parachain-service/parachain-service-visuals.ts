import { BoxGeometry, BufferGeometry, Group, Line, LineDashedMaterial, Mesh, Vector3 } from "three";
import { PARACHAIN_NOTES } from "./parachain-notes";
import { type ParachainPose, parachainPhase } from "./parachain-pose";
import { buildStateCylinder } from "./jam-state-cylinder";
import { PARACHAIN_HEAD, parachainHeadPosition } from "./report-paths";
import { CORE, HOST, PROTOCOL, READY, createScenePrimitives, curve, glow } from "./scene-primitives";
import { buildParachainLane } from "./parachain-lane";

const PARAS = [
  { name: "Asset Hub", color: 0x75bfd4 },
  { name: "Coretime", color: 0xd5b66e },
  { name: "Parachain A", color: 0x88c4aa },
] as const;

/** One host, independent candidates. Colour follows a parachain's data, not ownership of a core. */
export function buildParachainServiceVisuals(onInspect: () => void) {
  const group = new Group();
  group.position.set(-46, 0, 0);
  group.visible = false;
  const elements = createScenePrimitives(group, onInspect);
  const { label, inspect, note, route, rim, bar } = elements;

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
  note(stateTags[0]!, PARACHAIN_NOTES.availability);
  note(stateTags[2]!, PARACHAIN_NOTES.coretime);
  const phaseTag = label("Signed work-reports", "JAM block N", CORE, -1.95, 2.8);
  const phaseTitle = phaseTag.element.querySelector(".tag-title")!;
  const phaseMeta = phaseTag.element.querySelector(".tag-meta")!;
  const readyTag = label("Ready reports", "", READY, -1.95, 0.45);
  const hostState = new Group();
  hostState.name = "Parachain Service state";
  group.add(hostState);
  const hostTag = label("Parachain Service", "Host records", HOST, 0, -1.6);
  hostState.add(hostTag);
  note(hostTag, PARACHAIN_NOTES.accumulate);
  inspect(hostTag.element.querySelector<HTMLElement>(".tag-meta")!, PARACHAIN_NOTES.host, "Host records");
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

  const lanes = PARAS.map((parachain, index) =>
    buildParachainLane({ group, hostState, elements, parachain, index, pendingPoint }),
  );

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

  const update = (frame: ParachainPose) => {
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
    for (const lane of lanes) lane.update(frame);
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
