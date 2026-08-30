import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  TubeGeometry,
  Vector3,
} from "three";

/** Bright near the kidney, dissolving outward: only far-from-core ends fade. */
const TAIL_NEAR = 3;
const TAIL_FAR = 9.5;
const radialFade = (d: number) => Math.max(0, Math.min(1, (TAIL_FAR - d) / (TAIL_FAR - TAIL_NEAR)));

export type Stream = {
  points: Points;
  pos: Float32Array;
  colors: Float32Array;
  seeds: Float32Array;
  curve: CatmullRomCurve3;
  speed: number;
  spread: number;
};

export function makeCurve(pts: [number, number, number][]): CatmullRomCurve3 {
  return new CatmullRomCurve3(
    pts.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    "catmullrom",
    0.4,
  );
}

export function makeRibbon(curve: CatmullRomCurve3, radius: number, color: number, opacity: number): Mesh {
  const tubular = 80;
  const radial = 8;
  const geom = new TubeGeometry(curve, tubular, radius, radial, false);
  const pos = geom.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const fade = radialFade(Math.hypot(pos.getX(i), pos.getY(i), pos.getZ(i)));
    colors[i * 3] = fade;
    colors[i * 3 + 1] = fade;
    colors[i * 3 + 2] = fade;
  }
  geom.setAttribute("color", new BufferAttribute(colors, 3));
  const mat = new MeshBasicMaterial({
    color,
    vertexColors: true,
    transparent: true,
    opacity,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  return new Mesh(geom, mat);
}

export function makeStream(curve: CatmullRomCurve3, count: number, color: number, size: number, speed: number, spread: number): Stream {
  const pos = new Float32Array(count * 3);
  // RGBA vertex colors: alpha carries the tail fade (three's vertexAlphas path)
  const colors = new Float32Array(count * 4).fill(1);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = Math.random();
  const geom = new BufferGeometry();
  geom.setAttribute("position", new BufferAttribute(pos, 3));
  geom.setAttribute("color", new BufferAttribute(colors, 4));
  const points = new Points(
    geom,
    new PointsMaterial({
      color,
      size,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  return { points, pos, colors, seeds, curve, speed, spread };
}

export function tickStream(s: Stream, time: number, tmp: Vector3): void {
  const n = s.seeds.length;
  for (let i = 0; i < n; i++) {
    const seed = s.seeds[i] ?? 0;
    const u = (seed + time * s.speed) % 1;
    s.curve.getPointAt(u, tmp);
    const j = i * 3;
    const k = i * 4;
    const wobble = Math.sin(time * 7 + i) * s.spread;
    s.pos[j] = tmp.x + wobble;
    s.pos[j + 1] = tmp.y + Math.cos(time * 5 + i * 0.3) * s.spread;
    s.pos[j + 2] = tmp.z + Math.sin(time * 4 + i * 0.17) * s.spread;
    const fade = radialFade(tmp.length());
    s.colors[k + 3] = fade;
  }
  s.points.geometry.getAttribute("position").needsUpdate = true;
  s.points.geometry.getAttribute("color").needsUpdate = true;
}

