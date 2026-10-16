import { BufferAttribute, BufferGeometry, Group, LineSegments, Mesh, Points, PointsMaterial } from "three";

/** In-core work package: a dotted room that forms and dissolves. */
export type JamPod = {
  group: Group;
  dust: Points<BufferGeometry, PointsMaterial>;
  rest: Float32Array;
  burst: Float32Array;
  joins: Array<{ line: LineSegments; mesh: Mesh }>;
  phase: number;
};

export function buildPodDust(parent: Group, width: number, depth: number, height: number, seed: number) {
  const count = 72;
  const rest = new Float32Array(count * 3);
  const burst = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const bottom = 0.02;
  const segments = [
    [-halfWidth, bottom, -halfDepth, halfWidth, bottom, -halfDepth],
    [-halfWidth, bottom, halfDepth, halfWidth, bottom, halfDepth],
    [-halfWidth, bottom, -halfDepth, -halfWidth, bottom, halfDepth],
    [halfWidth, bottom, -halfDepth, halfWidth, bottom, halfDepth],
    [-halfWidth, height, -halfDepth, halfWidth, height, -halfDepth],
    [-halfWidth, height, halfDepth, halfWidth, height, halfDepth],
    [-halfWidth, height, -halfDepth, -halfWidth, height, halfDepth],
    [halfWidth, height, -halfDepth, halfWidth, height, halfDepth],
    [-halfWidth, bottom, -halfDepth, -halfWidth, height, -halfDepth],
    [halfWidth, bottom, -halfDepth, halfWidth, height, -halfDepth],
    [-halfWidth, bottom, halfDepth, -halfWidth, height, halfDepth],
    [halfWidth, bottom, halfDepth, halfWidth, height, halfDepth],
  ] as const;
  for (let i = 0; i < count; i++) {
    const edge = segments[i % segments.length]!;
    const t = ((i * 17 + seed * 13) % 100) / 100;
    const x = edge[0] + (edge[3] - edge[0]) * t;
    const y = edge[1] + (edge[4] - edge[1]) * t;
    const z = edge[2] + (edge[5] - edge[2]) * t;
    rest[i * 3] = x;
    rest[i * 3 + 1] = y;
    rest[i * 3 + 2] = z;
    const u = ((i * 31 + seed * 19) % 100) / 100;
    const v = ((i * 47 + seed * 23) % 100) / 100;
    const angle = u * Math.PI * 2;
    const elevation = (v - 0.35) * 1.4;
    const length = 0.28 + ((i * 11 + seed) % 10) * 0.05;
    const bx = Math.cos(angle) * length * 0.85;
    const by = 0.12 + Math.abs(elevation) * length;
    const bz = Math.sin(angle) * length * 0.85;
    burst[i * 3] = bx;
    burst[i * 3 + 1] = by;
    burst[i * 3 + 2] = bz;
    positions[i * 3] = x + bx;
    positions[i * 3 + 1] = y + by;
    positions[i * 3 + 2] = z + bz;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  const material = new PointsMaterial({
    color: 0xf07828,
    size: 0.03,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const dust = new Points(geometry, material);
  parent.add(dust);
  return { dust, rest, burst };
}

/** Deterministic formation, occupancy and dissolution within the eight-second visual cycle. */
export function deriveRoomPose(time: number, phase: number) {
  const cycle = 8;
  const occupy = 0.75;
  const formLength = 0.07;
  const dissolveLength = 0.07;
  const progress = ((((time + phase) % cycle) + cycle) % cycle) / cycle;
  let assembled = 0;
  let scatter = 1;
  let dustOpacity = 0;
  if (progress < formLength) {
    const amount = progress / formLength;
    scatter = (1 - amount) * (1 - amount);
    dustOpacity = Math.min(1, 0.35 + amount);
    assembled = 1;
  } else if (progress < occupy - dissolveLength) {
    scatter = 0;
    dustOpacity = 0;
    assembled = 1;
  } else if (progress < occupy) {
    const amount = (progress - (occupy - dissolveLength)) / dissolveLength;
    assembled = 1;
    scatter = amount * amount * (3 - 2 * amount);
    dustOpacity = amount < 0.75 ? 1 : 1 - (amount - 0.75) / 0.25;
  }
  return { assembled, scatter, dustOpacity };
}

export function updateJamPods(pods: JamPod[], time: number, fade: number): void {
  for (const pod of pods) {
    const { assembled, scatter, dustOpacity } = deriveRoomPose(time, pod.phase);
    pod.group.visible = assembled > 0.06;
    for (const join of pod.joins) {
      join.line.visible = assembled > 0.55;
      join.mesh.visible = assembled > 0.55;
    }
    const positions = pod.dust.geometry.getAttribute("position");
    for (let i = 0; i < pod.rest.length; i += 3) {
      positions.setXYZ(
        i / 3,
        pod.rest[i]! + pod.burst[i]! * scatter,
        pod.rest[i + 1]! + pod.burst[i + 1]! * scatter + scatter * scatter * 0.18,
        pod.rest[i + 2]! + pod.burst[i + 2]! * scatter,
      );
    }
    positions.needsUpdate = true;
    pod.dust.material.opacity = dustOpacity * fade;
    pod.dust.visible = dustOpacity > 0.03 && fade > 0.03;
  }
}
