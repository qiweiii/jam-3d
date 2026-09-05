import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from "three";
import { TERMS } from "../content/references";
import { WHY_STOPS } from "../content/why";
import { tag } from "./tag";
import { wrapTerm } from "../ui/bubble";

/** Left-to-right timeline of designs; each stop is a small diorama. */
const STOP_GAP = 5;
const STOP_X0 = 46;
const stopX = (i: number) => STOP_X0 + i * STOP_GAP;

type FadePair = { material: Material; base: number };

type Pulse = {
  from: Vector3;
  to: Vector3;
  mesh: Mesh;
  speed: number;
  phase: number;
};

/** In-core WP on a core: dotted room that forms and dissolves. */
type JamPod = {
  group: Group;
  dust: Points;
  rest: Float32Array;
  burst: Float32Array;
  joins: Array<{ line: LineSegments; mesh: Mesh }>;
  phase: number;
};

type StopFrame = { position: Vector3; target: Vector3 };

export type Why = {
  group: Group;
  stopFrames: StopFrame[];
  setOpacity: (v: number) => void;
  update: (t: number) => void;
};

export function buildWhy(): Why {
  const group = new Group();
  group.visible = false;
  const fades: FadePair[] = [];
  const pulses: Pulse[] = [];
  const jamPods: JamPod[] = [];
  let stageFade = 1;

  const track = <T extends Material>(material: T, base: number): T => {
    material.transparent = true;
    fades.push({ material, base });
    return material;
  };

  const floorMat = track(new MeshStandardMaterial({ color: 0x10141c, roughness: 0.85, metalness: 0.2 }), 1);
  const wallMat = track(new LineBasicMaterial({ color: 0x40526b }), 0.9);
  const bodyMat = track(
    new MeshStandardMaterial({ color: 0x2a2f3c, emissive: 0xe8d9c5, emissiveIntensity: 0.55, roughness: 0.6 }),
    1,
  );
  const headMat = track(new MeshBasicMaterial({ color: 0xf2e9d8 }), 1);
  const syncMat = track(new LineBasicMaterial({ color: 0x7fd4ee }), 0.55);
  const asyncMat = track(new LineBasicMaterial({ color: 0xd6a45f }), 0.4);
  const faintMat = track(new LineBasicMaterial({ color: 0x55627a }), 0.22);
  const pulseMat = track(new MeshBasicMaterial({ color: 0xcdeefb }), 1);
  const warmPulseMat = track(new MeshBasicMaterial({ color: 0xf0c48a }), 1);
  const guardMat = track(
    new MeshStandardMaterial({ color: 0x1c2432, emissive: 0xe45a88, emissiveIntensity: 0.35, roughness: 0.5, metalness: 0.3 }),
    1,
  );
  const tableMat = track(
    new MeshStandardMaterial({ color: 0x141a24, emissive: 0xf07828, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.35 }),
    1,
  );
  const tableRimMat = track(new MeshBasicMaterial({ color: 0xf07828 }), 0.9);

  const roomGeomCache = new Map<string, { floor: BufferGeometry; edges: BufferGeometry }>();
  const room = (parent: Group, w: number, d: number, h = 0.7) => {
    const key = `${w}:${d}:${h}`;
    let geoms = roomGeomCache.get(key);
    if (!geoms) {
      const box = new BoxGeometry(w, h, d);
      geoms = { floor: new BoxGeometry(w, 0.035, d), edges: new EdgesGeometry(box) };
      roomGeomCache.set(key, geoms);
    }
    const floor = new Mesh(geoms.floor, floorMat);
    const walls = new LineSegments(geoms.edges, wallMat);
    walls.position.y = h / 2;
    parent.add(floor, walls);
  };

  const dottedRoom = (parent: Group, w: number, d: number, h: number) => {
    const edges = new EdgesGeometry(new BoxGeometry(w, h, d));
    const mat = track(
      new LineDashedMaterial({ color: 0xf07828, dashSize: 0.07, gapSize: 0.05 }),
      0.8,
    );
    const walls = new LineSegments(edges, mat);
    walls.computeLineDistances();
    walls.position.y = h / 2;
    parent.add(walls);
  };

  const roomDust = (parent: Group, w: number, d: number, h: number, seed: number) => {
    const n = 72;
    const rest = new Float32Array(n * 3);
    const burst = new Float32Array(n * 3);
    const pos = new Float32Array(n * 3);
    const hx = w / 2;
    const hz = d / 2;
    const y0 = 0.02;
    const y1 = h;
    const segs = [
      [-hx, y0, -hz, hx, y0, -hz],
      [-hx, y0, hz, hx, y0, hz],
      [-hx, y0, -hz, -hx, y0, hz],
      [hx, y0, -hz, hx, y0, hz],
      [-hx, y1, -hz, hx, y1, -hz],
      [-hx, y1, hz, hx, y1, hz],
      [-hx, y1, -hz, -hx, y1, hz],
      [hx, y1, -hz, hx, y1, hz],
      [-hx, y0, -hz, -hx, y1, -hz],
      [hx, y0, -hz, hx, y1, -hz],
      [-hx, y0, hz, -hx, y1, hz],
      [hx, y0, hz, hx, y1, hz],
    ] as const;
    for (let i = 0; i < n; i++) {
      const e = segs[i % 12]!;
      const t = ((i * 17 + seed * 13) % 100) / 100;
      const x = e[0] + (e[3] - e[0]) * t;
      const y = e[1] + (e[4] - e[1]) * t;
      const z = e[2] + (e[5] - e[2]) * t;
      rest[i * 3] = x;
      rest[i * 3 + 1] = y;
      rest[i * 3 + 2] = z;
      const u = ((i * 31 + seed * 19) % 100) / 100;
      const v = ((i * 47 + seed * 23) % 100) / 100;
      const a = u * Math.PI * 2;
      const b = (v - 0.35) * 1.4;
      const len = 0.28 + ((i * 11 + seed) % 10) * 0.05;
      const bx = Math.cos(a) * len * 0.85;
      const by = 0.12 + Math.abs(b) * len;
      const bz = Math.sin(a) * len * 0.85;
      burst[i * 3] = bx;
      burst[i * 3 + 1] = by;
      burst[i * 3 + 2] = bz;
      pos[i * 3] = x + bx;
      pos[i * 3 + 1] = y + by;
      pos[i * 3 + 2] = z + bz;
    }
    const geom = new BufferGeometry();
    geom.setAttribute("position", new BufferAttribute(pos, 3));
    const mat = new PointsMaterial({
      color: 0xf07828,
      size: 0.03,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const dust = new Points(geom, mat);
    parent.add(dust);
    return { dust, rest, burst };
  };

  const figure = () => {
    const g = new Group();
    const body = new Mesh(new CapsuleGeometry(0.045, 0.1, 3, 10), bodyMat);
    body.position.y = 0.09;
    const head = new Mesh(new SphereGeometry(0.032, 12, 10), headMat);
    head.position.y = 0.21;
    g.add(body, head);
    return g;
  };

  const person = (parent: Group, x: number, z: number) => {
    const g = figure();
    g.position.set(x, 0, z);
    parent.add(g);
    return new Vector3(x, 0.14, z);
  };

  /** A conversation line with an optional traveling pulse: people talking. */
  const talk = (parent: Group, a: Vector3, b: Vector3, kind: "sync" | "async" | "faint", pulse = true) => {
    const geom = new BufferGeometry().setFromPoints([a, b]);
    const line = new LineSegments(geom, kind === "sync" ? syncMat : kind === "async" ? asyncMat : faintMat);
    parent.add(line);
    if (pulse && kind !== "faint") {
      const mesh = new Mesh(
        new SphereGeometry(kind === "sync" ? 0.018 : 0.026, 8, 8),
        kind === "sync" ? pulseMat : warmPulseMat,
      );
      parent.add(mesh);
      pulses.push({
        from: a.clone(),
        to: b.clone(),
        mesh,
        speed: kind === "sync" ? 0.55 + Math.random() * 0.3 : 0.16,
        phase: Math.random(),
      });
    }
  };

  const table = (parent: Group) => {
    const top = new Mesh(new CylinderGeometry(0.3, 0.3, 0.03, 28), tableMat);
    top.position.y = 0.3;
    const rim = new Mesh(new TorusGeometry(0.3, 0.011, 10, 40), tableRimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.315;
    parent.add(top, rim);
    for (let i = 0; i < 3; i++) {
      const leg = new Mesh(new CylinderGeometry(0.014, 0.02, 0.3, 8), tableMat);
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
      leg.position.set(Math.cos(angle) * 0.2, 0.15, Math.sin(angle) * 0.2);
      parent.add(leg);
    }
    return new Vector3(0, 0.33, 0);
  };

  const label = (i: number, title: string, meta: string, color: string, term: keyof typeof TERMS) => {
    const el = tag(title, meta, color, "why");
    el.position.set(stopX(i), 0.95, 0);
    group.add(el);
    wrapTerm(el.element.querySelector(".tag-title") ?? el.element, title, TERMS[term]);
  };

  const anchorOf = (i: number, frame: Group) => {
    const anchor = new Group();
    anchor.position.set(stopX(i), 0, 0);
    anchor.add(frame);
    group.add(anchor);
  };

  // 0 · the law: two tight clusters that can no longer hear each other.
  {
    const frame = new Group();
    room(frame, 2.7, 1.05, 0.55);
    const clusterA = [
      person(frame, -1.0, -0.15),
      person(frame, -0.84, -0.15),
      person(frame, -1.14, 0.22),
    ] as const;
    const clusterB = [
      person(frame, 1.0, -0.15),
      person(frame, 0.84, -0.15),
      person(frame, 1.14, 0.22),
    ] as const;
    for (const cluster of [clusterA, clusterB]) {
      talk(frame, cluster[0], cluster[1], "sync");
      talk(frame, cluster[1], cluster[2], "sync");
      talk(frame, cluster[2], cluster[0], "sync");
    }
    talk(frame, clusterA[2], clusterB[2], "faint", false);
    anchorOf(0, frame);
    label(0, "Size-coherency antagonism", "§1.3", "#b8c0c8", "whyLaw");
  }

  // 1 · ethereum: one small room, everyone talks to everyone.
  {
    const frame = new Group();
    room(frame, 1.7, 1.25);
    const seatSpots = [
      [-0.45, -0.3],
      [0, -0.38],
      [0.45, -0.3],
      [0.58, 0.05],
      [0.32, 0.34],
      [-0.32, 0.34],
      [-0.58, 0.05],
    ] as const;
    const seats = seatSpots.map(([x, z]) => person(frame, x, z));
    for (let a = 0; a < seats.length; a++) {
      for (let b = a + 1; b < seats.length; b++) {
        const loud = (a + b) % 3 === 0;
        talk(frame, seats[a]!, seats[b]!, loud ? "sync" : "faint", loud);
      }
    }
    anchorOf(1, frame);
    label(1, "Ethereum", "One room", "#8c7cff", "whyEthereum");
  }

  // 2 · L2s: main room plus side rooms behind doors.
  {
    const frame = new Group();
    const main = new Group();
    main.position.x = -0.55;
    room(main, 1.2, 0.95);
    const mainSeats = [
      person(main, -0.28, -0.18),
      person(main, 0.05, -0.22),
      person(main, 0.3, 0.12),
      person(main, -0.1, 0.22),
    ];
    talk(main, mainSeats[0]!, mainSeats[1]!, "sync");
    talk(main, mainSeats[1]!, mainSeats[2]!, "sync");
    talk(main, mainSeats[2]!, mainSeats[3]!, "sync");
    talk(main, mainSeats[3]!, mainSeats[0]!, "sync");
    frame.add(main);
    const sideCenters = [
      [0.75, 0.32],
      [0.98, -0.08],
      [0.75, -0.46],
    ] as const;
    const hinges = [mainSeats[2]!, mainSeats[2]!, mainSeats[1]!] as const;
    for (const [k, center] of sideCenters.entries()) {
      const [cx, cz] = center;
      const side = new Group();
      side.position.set(cx, 0, cz);
      room(side, 0.52, 0.4, 0.45);
      const s1 = person(side, -0.1, 0.02);
      const s2 = person(side, 0.12, -0.06);
      talk(side, s1, s2, "sync");
      frame.add(side);
      const hinge = main.position.clone().add(hinges[k]!);
      const door = side.position.clone().add(s2);
      talk(frame, hinge, door, "async");
    }
    anchorOf(2, frame);
    label(2, "L2s", "Side rooms", "#6f8cff", "whyL2s");
  }

  // 3 · solana: one giant room, dense crowd, one conversation.
  {
    const frame = new Group();
    room(frame, 2.6, 1.7, 0.85);
    const grid: Vector3[] = [];
    for (let gx = -1.05; gx <= 1.05; gx += 0.35) {
      for (let gz = -0.55; gz <= 0.55; gz += 0.37) {
        grid.push(person(frame, gx + (gz > 0 ? 0.06 : -0.04), gz));
      }
    }
    for (let a = 0; a < grid.length; a++) {
      for (let b = a + 1; b < grid.length; b++) {
        const near = grid[a]!.distanceTo(grid[b]!) < 0.45;
        if (!near && (a * 7 + b * 13) % 5 !== 0) continue;
        talk(frame, grid[a]!, grid[b]!, near ? "sync" : "faint", near && (a + b) % 4 === 0);
      }
    }
    anchorOf(3, frame);
    label(3, "Solana", "One giant room", "#69c99b", "whySolana");
  }

  // 4 · polkadot: rooms plus one main room; letters travel through the main room.
  {
    const frame = new Group();
    const main = new Group();
    main.position.set(0, 0, -0.75);
    room(main, 0.95, 0.5, 0.4);
    const guard = (x: number) => {
      const body = new Mesh(new CapsuleGeometry(0.05, 0.1, 3, 10), guardMat);
      body.position.set(x, 0.09, 0);
      const head = new Mesh(new SphereGeometry(0.034, 12, 10), headMat);
      head.position.set(x, 0.22, 0);
      main.add(body, head);
      return new Vector3(x, 0.14, 0);
    };
    const ga = guard(-0.15);
    const gb = guard(0.15);
    talk(main, ga, gb, "sync");
    frame.add(main);
    const mainPort = new Vector3(0, 0.3, -0.5);
    const roomOffsets = [
      [-0.85, 0.28],
      [-0.3, 0.34],
      [0.3, 0.34],
      [0.85, 0.28],
    ] as const;
    for (const [cx, cz] of roomOffsets) {
      const pod = new Group();
      pod.position.set(cx, 0, cz);
      room(pod, 0.55, 0.45, 0.5);
      const p1 = person(pod, -0.1, 0.04);
      const p2 = person(pod, 0.12, -0.04);
      talk(pod, p1, p2, "sync");
      frame.add(pod);
      const port = pod.position.clone().add(p2).setZ(pod.position.z - 0.14);
      talk(frame, port, mainPort, "async");
    }
    anchorOf(4, frame);
    label(4, "Polkadot", "Rooms + rental", "#e45a88", "whyPolkadot");
  }

  // 5 · jam: dotted WPs form/dissolve around on-chain.
  {
    const frame = new Group();
    const tablePort = table(frame);
    const pods = [
      [-0.95, 0.3],
      [-0.35, 0.42],
      [0.35, 0.42],
      [0.95, 0.3],
    ] as const;
    for (const [i, [cx, cz]] of pods.entries()) {
      const pod = new Group();
      pod.position.set(cx, 0, cz);
      dottedRoom(pod, 0.5, 0.42, 0.45);
      const trio = [
        person(pod, -0.12, 0.05),
        person(pod, 0.02, -0.08),
        person(pod, 0.14, 0.07),
      ] as const;
      talk(pod, trio[0], trio[1], "sync");
      talk(pod, trio[1], trio[2], "sync");
      frame.add(pod);
      const { dust, rest, burst } = roomDust(frame, 0.5, 0.42, 0.45, i + 1);
      dust.position.set(cx, 0, cz);
      const from = new Vector3(cx, 0.14, cz);
      const geom = new BufferGeometry().setFromPoints([from, tablePort]);
      const line = new LineSegments(geom, syncMat);
      frame.add(line);
      const mesh = new Mesh(new SphereGeometry(0.018, 8, 8), pulseMat);
      frame.add(mesh);
      pulses.push({
        from: from.clone(),
        to: tablePort.clone(),
        mesh,
        speed: 0.6,
        phase: i * 0.2,
      });
      jamPods.push({
        group: pod,
        dust,
        rest,
        burst,
        joins: [{ line, mesh }],
        phase: i * 2,
      });
    }
    anchorOf(5, frame);
    label(5, "JAM", "Dynamic Rooms", "#f07828", "whyJam");
  }

  const stopFrames: StopFrame[] = WHY_STOPS.map((_, i) => ({
    position: new Vector3(stopX(i), 1.18, 4.3),
    target: new Vector3(stopX(i), 0.32, 0),
  }));

  return {
    group,
    stopFrames,
    setOpacity(v: number) {
      stageFade = v;
      for (const { material, base } of fades) material.opacity = base * v;
      group.visible = v > 0.03;
    },
    update(t: number) {
      for (const pulse of pulses) {
        const k = (t * pulse.speed + pulse.phase) % 1;
        pulse.mesh.position.lerpVectors(pulse.from, pulse.to, k);
      }
      const cycle = 8;
      const occupy = 0.75;
      const formLen = 0.035;
      const dissolveLen = 0.035;
      for (const pod of jamPods) {
        const u = ((((t + pod.phase) % cycle) + cycle) % cycle) / cycle;
        let assembled = 0;
        let scatter = 1;
        let dustOp = 0;
        if (u < formLen) {
          const k = u / formLen;
          scatter = (1 - k) * (1 - k);
          dustOp = Math.min(1, 0.35 + k);
          assembled = 1;
        } else if (u < occupy - dissolveLen) {
          scatter = 0;
          dustOp = 0;
          assembled = 1;
        } else if (u < occupy) {
          const k = (u - (occupy - dissolveLen)) / dissolveLen;
          assembled = 1;
          scatter = k * k * (3 - 2 * k);
          dustOp = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
        }
        pod.group.visible = assembled > 0.06;
        for (const join of pod.joins) {
          join.line.visible = assembled > 0.55;
          join.mesh.visible = assembled > 0.55;
        }
        const attr = pod.dust.geometry.getAttribute("position");
        const rest = pod.rest;
        const burst = pod.burst;
        for (let i = 0; i < rest.length; i += 3) {
          attr.setXYZ(
            i / 3,
            rest[i]! + burst[i]! * scatter,
            rest[i + 1]! + burst[i + 1]! * scatter + scatter * scatter * 0.18,
            rest[i + 2]! + burst[i + 2]! * scatter,
          );
        }
        attr.needsUpdate = true;
        const mat = pod.dust.material as PointsMaterial;
        mat.opacity = dustOp * stageFade;
        pod.dust.visible = dustOp > 0.03 && stageFade > 0.03;
      }
    },
  };
}
