import {
  BackSide,
  CatmullRomCurve3,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
} from "three";
import { wrapTerm } from "../bubble";
import { HERO, INNER, type LodId } from "../lod";
import { makeCurve, makeRibbon, makeStream, type Stream } from "./streams";
import { TERMS } from "../refs";
import { tag } from "./tag";

const PAST = 0xf0c43a;
const NEXT = 0xf07828;
const FUTURE = 0xe24c1c;
const LOOKUP = 0x5ec8e8;
const PURPLE = 0x7b6cff;
const PINK = 0xe070a0;
const CORE = 0x4aa8c8;

export type Anatomy = {
  group: Group;
  body: Mesh;
  outline: Mesh;
  store: Mesh;
  streams: Stream[];
};

/** The hero core, cut open: kidney body + tail, preimage store, data streams, pins. Jam-local units. */
export function buildAnatomy(): Anatomy {
  const group = new Group();
  group.position.copy(HERO);
  group.scale.setScalar(INNER);

  const coreGeom = new SphereGeometry(1, 48, 48);
  const coreMat = new MeshStandardMaterial({
    color: 0x0c1a22,
    emissive: CORE,
    emissiveIntensity: 0.55,
    roughness: 0.28,
    metalness: 0.35,
  });
  const body = new Mesh(coreGeom, coreMat);
  body.scale.set(1.85, 1.15, 1.25);
  group.add(body);

  const outline = new Mesh(
    coreGeom,
    new MeshBasicMaterial({ color: 0xf4f1ea, side: BackSide, transparent: true, opacity: 0.22 }),
  );
  outline.scale.copy(body.scale).multiplyScalar(1.045);
  group.add(outline);

  const tail = new Mesh(coreGeom, coreMat);
  tail.scale.set(0.62, 0.42, 0.48);
  tail.position.set(2.55, 0.12, 0.15);
  group.add(tail);

  const neck = new Mesh(
    new TubeGeometry(makeCurve([[1.4, 0.05, 0], [2.0, 0.1, 0.08], [2.4, 0.12, 0.12]]), 12, 0.22, 10, false),
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
  store.position.set(4.6, 2.35, -0.4);
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
    [4.4, 2.2, -0.3],
    [2.8, 2.4, -0.1],
    [0.6, 1.6, 0.05],
    [0.15, 0.7, 0],
  ]);
  const upload = makeCurve([
    [8.8, 3.1, -0.8],
    [7.0, 2.8, -0.55],
    [5.6, 2.5, -0.45],
    [5.0, 2.4, -0.4],
  ]);
  const refine = makeCurve([
    [1.7, 0.05, 0.05],
    [2.2, 0.08, 0.1],
    [2.55, 0.12, 0.15],
  ]);
  const spray = makeCurve([
    [2.9, 0.15, 0.2],
    [4.2, 0.6, 0.8],
    [5.6, 1.1, 1.4],
    [6.8, 1.6, 2.2],
  ]);

  group.add(makeRibbon(past, 0.085, PAST, 0.22));
  group.add(makeRibbon(incoming, 0.07, NEXT, 0.2));
  group.add(makeRibbon(future, 0.08, FUTURE, 0.22));
  group.add(makeRibbon(lookup, 0.04, LOOKUP, 0.35));
  group.add(makeRibbon(upload, 0.035, LOOKUP, 0.28));
  group.add(makeRibbon(refine, 0.05, PURPLE, 0.4));
  group.add(makeRibbon(spray, 0.025, PINK, 0.25));

  const streams: Stream[] = [
    makeStream(past, 420, PAST, 0.048, 0.22, 0.07),
    makeStream(incoming, 360, NEXT, 0.042, 0.28, 0.06),
    makeStream(future, 380, FUTURE, 0.048, 0.24, 0.07),
    makeStream(lookup, 220, LOOKUP, 0.037, 0.45, 0.04),
    makeStream(upload, 180, LOOKUP, 0.034, 0.5, 0.03),
    makeStream(refine, 90, PURPLE, 0.03, 0.6, 0.02),
    makeStream(spray, 260, PINK, 0.027, 0.35, 0.12),
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
  pin(past, 0.78, "past", "2 MB/s in", "#f0c43a", ["core", "package"]);
  pin(incoming, 0.86, "new", "2 MB/s in", "#f07828", ["core", "package"]);
  pin(future, 0.24, "future", "2 MB/s out", "#e24c1c", ["core", "package"]);
  const lookupTag = pin(lookup, 0.8, "lookup", "preimage → core", "#5ec8e8", "core");
  pin(upload, 0.8, "upload", "326 KB/s", "#5ec8e8", "core");
  pin(refine, 0.55, "refine", "8 KB/s · 60% PVM", "#7b6cff", ["core", "package"]);
  pin(spray, 0.25, "access", "~1e6 /s", "#e070a0", "core");

  const coreTag = tag("PVM core", "in-core execution", "#6ec8e6", ["core", "package"]);
  coreTag.position.set(0, 0.15, 0);
  group.add(coreTag);
  const storeTag = tag("preimage store", "DA / blobs", "#5ec8e8", "core");
  storeTag.position.set(4.2, 2.7, -0.4);
  group.add(storeTag);
  wrapTerm(storeTag.element.querySelector(".tag-title") ?? storeTag.element, "preimage", TERMS.preimage);
  wrapTerm(lookupTag.element.querySelector(".tag-meta") ?? lookupTag.element, "preimage", TERMS.preimage);

  return { group, body, outline, store, streams };
}
