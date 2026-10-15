import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { BLOCK_GAP, HERO, INNER, NOW_BLOCK, PVM_SHIFT_X } from "./layout";
import { makeCurve, makeRibbon, makeStream, type Stream } from "./streams";
import { TERMS, type Term } from "../content/references";
import { tag } from "./tag";
import type { LodId } from "../experience/views";
import { wrapTerm } from "../ui/bubble";
import { createCoreShell } from "./core-shell";

const PAST = 0xf0c43a;
const NEXT = 0xf07828;
const FUTURE = 0xe24c1c;
const LOOKUP = 0x5ec8e8;
const PURPLE = 0x7b6cff;
const CORE = 0x4aa8c8;
const PINK = 0xe45a88;

/** A continuous translucent oval volume with two rails; no particles or repeated segments. */
function makeOnChainBand(curve: CatmullRomCurve3, width: number): Group {
  const segments = 220;
  const radialSegments = 12;
  const halfDepth = 0.75;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const leftBank: Vector3[] = [];
  const rightBank: Vector3[] = [];
  const point = new Vector3();
  const side = new Vector3();
  const binormal = new Vector3();

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    curve.getPointAt(u, point);
    const tangent = curve.getTangentAt(u);
    side.set(-tangent.y, tangent.x, 0).normalize();
    binormal.crossVectors(tangent, side).normalize();
    const halfWidth = width * (0.47 + Math.sin(u * Math.PI * 5) ** 2 * 0.03);
    leftBank.push(point.clone().addScaledVector(side, halfWidth));
    rightBank.push(point.clone().addScaledVector(side, -halfWidth));

    for (let j = 0; j < radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const across = Math.cos(angle) * halfWidth;
      const deep = Math.sin(angle) * halfDepth;
      positions.push(
        point.x + side.x * across + binormal.x * deep,
        point.y + side.y * across + binormal.y * deep,
        point.z + side.z * across + binormal.z * deep,
      );
      uvs.push(u, j / radialSegments);
    }

    if (i === segments) continue;
    const ring = i * radialSegments;
    const next = ring + radialSegments;
    for (let j = 0; j < radialSegments; j++) {
      const k = (j + 1) % radialSegments;
      indices.push(ring + j, ring + k, next + j, ring + k, next + k, next + j);
    }
  }

  const material = (opacity: number) =>
    new ShaderMaterial({
      uniforms: {
        color: { value: new Color(PINK) },
        opacity: { value: opacity },
      },
      vertexShader: `
        varying float vAlong;
        void main() {
          vAlong = uv.x;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        varying float vAlong;
        void main() {
          float endFade = smoothstep(0.0, 0.34, vAlong) * smoothstep(0.0, 0.34, 1.0 - vAlong);
          gl_FragColor = vec4(color, opacity * endFade);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  const river = new Group();
  river.add(
    new Mesh(geometry, material(0.055)),
    new Mesh(new TubeGeometry(new CatmullRomCurve3(leftBank), segments, 0.04, 6, false), material(0.34)),
    new Mesh(new TubeGeometry(new CatmullRomCurve3(rightBank), segments, 0.04, 6, false), material(0.34)),
  );
  return river;
}

export type Anatomy = {
  group: Group;
  body: Mesh;
  outline: Mesh;
  store: Mesh;
  streams: Stream[];
  setCutaway: (enabled: boolean) => void;
};

/** The hero core, cut open: PVM body + lobe into the on-chain band, preimage store, streams. */
export function buildAnatomy(): Anatomy {
  const group = new Group();
  group.position.copy(HERO);
  group.scale.setScalar(INNER);

  const coreGeom = new SphereGeometry(1, 48, 48);
  const shell = createCoreShell({
    color: 0x0c1a22,
    emissive: CORE,
    emissiveIntensity: 0.55,
    roughness: 0.28,
    metalness: 0.35,
  });
  const coreMat = shell.material;
  const body = new Mesh(coreGeom, coreMat);
  body.scale.set(1.85, 1.15, 1.25);
  body.position.x = PVM_SHIFT_X;
  group.add(body);

  const outline = new Mesh(
    coreGeom,
    new MeshBasicMaterial({ color: 0xf4f1ea, side: BackSide, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  outline.scale.copy(body.scale).multiplyScalar(1.045);
  outline.position.copy(body.position);
  group.add(outline);

  const chainX = (NOW_BLOCK.x - HERO.x) / INNER;
  const chainY = (NOW_BLOCK.y - HERO.y) / INNER;
  const chainZ = (NOW_BLOCK.z - HERO.z) / INNER;
  const chainEndY = (NOW_BLOCK.y - BLOCK_GAP * 10 - HERO.y) / INNER;
  const onChainCurve = makeCurve([
    [3.6, 24, 0.3],
    [3.8, 16, 0.2],
    [4.2, 9, 0.15],
    [4.55, 3, 0.12],
    [4.7, 0, 0.2],
    [4.9, -3, 0.4],
    [chainX, chainY, chainZ],
    [chainX + 0.2, chainY - 15, chainZ + 0.05],
    [chainX - 0.15, chainEndY, chainZ],
  ]);
  group.add(makeOnChainBand(onChainCurve, 3.0));

  const tail = new Mesh(coreGeom, coreMat);
  tail.scale.set(0.62, 0.42, 0.48);
  tail.position.set(3.05 + PVM_SHIFT_X, 0.08, 0.12);
  group.add(tail);

  const neck = new Mesh(
    new TubeGeometry(
      makeCurve([
        [1.45 + PVM_SHIFT_X, 0.04, 0],
        [2.15 + PVM_SHIFT_X, 0.08, 0.08],
        [2.75 + PVM_SHIFT_X, 0.08, 0.12],
      ]),
      12,
      0.22,
      10,
      false,
    ),
    coreMat,
  );
  group.add(neck);

  const store = new Mesh(
    new SphereGeometry(0.55, 24, 24),
    new MeshStandardMaterial({
      color: 0x102028,
      emissive: LOOKUP,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.2,
    }),
  );
  store.position.set(4.55, 1.4, 0.12);
  group.add(store);

  const past = makeCurve([
    [-9.5, 2.8, 0.2],
    [-6.2, 2.1, 0.4],
    [-3.2, 0.9, 0.1],
    [-1.5, 0.15, 0],
  ]);
  const incoming = makeCurve([
    [-9.2, 0.4, -0.3],
    [-6.0, 0.2, 0.2],
    [-3.0, 0.0, 0.15],
    [-1.6, -0.05, 0],
  ]);
  const future = makeCurve([
    [-1.4, -0.35, 0.1],
    [-3.4, -1.4, 0.2],
    [-5.8, -2.6, 0.0],
    [-8.6, -3.5, -0.2],
  ]);
  const lookup = makeCurve([
    [4.4, 1.35, 0.1],
    [2.25, 1.5, 0.02],
    [1.55, 1.0, 0],
    [0.2, 0.55, 0],
  ]);
  const upload = makeCurve([
    [9.0, 7.0, 0.2],
    [7.0, 4.8, 0.18],
    [5.5, 2.4, 0.15],
    [4.75, 1.45, 0.13],
  ]);
  const refine = makeCurve([
    [0.1 + PVM_SHIFT_X, -0.35, 0.05],
    [0.7 + PVM_SHIFT_X, -0.55, 0.06],
    [1.3 + PVM_SHIFT_X, -0.72, 0.05],
  ]);
  group.add(makeRibbon(past, 0.085, PAST, 0.22));
  group.add(makeRibbon(incoming, 0.07, NEXT, 0.2));
  group.add(makeRibbon(future, 0.08, FUTURE, 0.22));
  group.add(makeRibbon(lookup, 0.04, LOOKUP, 0.35));
  group.add(makeRibbon(upload, 0.035, LOOKUP, 0.28));
  group.add(makeRibbon(refine, 0.05, PURPLE, 0.4));

  const streams: Stream[] = [
    makeStream(past, 420, PAST, 0.048, 0.22, 0.07),
    makeStream(incoming, 360, NEXT, 0.042, 0.28, 0.06),
    makeStream(future, 380, FUTURE, 0.048, 0.24, 0.07),
    makeStream(lookup, 220, LOOKUP, 0.037, 0.45, 0.04),
    makeStream(upload, 180, LOOKUP, 0.034, 0.5, 0.03),
    makeStream(refine, 90, PURPLE, 0.03, 0.6, 0.02),
  ];
  for (const s of streams) group.add(s.points);

  const pin = (
    curve: CatmullRomCurve3,
    u: number,
    title: string,
    meta: string,
    color: string,
    lod: LodId | LodId[],
  ) => {
    const obj = tag(title, meta, color, lod);
    curve.getPointAt(u, obj.position);
    group.add(obj);
    return obj;
  };
  const pastTag = pin(past, 0.78, "Past", "2 MB/s in", "#f0c43a", ["core", "package"]);
  const newTag = pin(incoming, 0.86, "New", "Work package in", "#f07828", ["core", "package"]);
  const futureTag = pin(future, 0.24, "Future", "2 MB/s out", "#e24c1c", ["core", "package"]);
  const lookupTag = pin(lookup, 0.68, "Lookup", "Preimage → core", "#5ec8e8", ["core", "package"]);
  const uploadTag = pin(upload, 0.8, "Upload", "Preimages into the store", "#5ec8e8", ["core", "package"]);
  const refineTag = pin(refine, 0.55, "Refine", "In-core", "#7b6cff", ["core", "package"]);
  const coreTag = tag("PVM core", "", "#6ec8e6", ["core", "package"]);
  coreTag.position.set(-0.15 + PVM_SHIFT_X, 0.15, 0);
  group.add(coreTag);
  wrapTerm(coreTag.element.querySelector(".tag-title") ?? coreTag.element, "PVM core", TERMS.pvm);
  const accessTag = tag("State access", "Read + write", "#e45a88", ["core", "package"]);
  accessTag.position.set(3.05 + PVM_SHIFT_X, 0.08, 0.12);
  group.add(accessTag);
  const storeTag = tag("Preimage store", "Hash → blob", "#5ec8e8", ["core", "package"]);
  storeTag.position.set(4.55, 2.05, 0.12);
  group.add(storeTag);
  wrapTerm(storeTag.element.querySelector(".tag-title") ?? storeTag.element, "preimage store", TERMS.store);
  const wrapTitle = (obj: { element: HTMLElement }, term: string, def: Term) => {
    wrapTerm(obj.element.querySelector(".tag-title") ?? obj.element, term, def);
  };
  wrapTitle(pastTag, "past", TERMS.past);
  wrapTitle(newTag, "new", TERMS.new);
  wrapTitle(futureTag, "future", TERMS.future);
  wrapTitle(refineTag, "refine", TERMS.refine);
  wrapTitle(accessTag, "state access", TERMS.stateAccess);
  wrapTitle(uploadTag, "upload", TERMS.upload);
  wrapTerm(lookupTag.element.querySelector(".tag-meta") ?? lookupTag.element, "preimage", TERMS.preimage);

  const setCutaway = (enabled: boolean) => {
    shell.setCutaway(enabled);
    outline.material.opacity = enabled ? 0.08 : 0.22;
  };
  return { group, body, outline, store, streams, setCutaway };
}
