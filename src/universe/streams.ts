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

export type Stream = {
  points: Points;
  pos: Float32Array;
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
    const t = Math.floor(i / (radial + 1)) / tubular;
    const fade = Math.min(t / 0.18, 1) * Math.min((1 - t) / 0.18, 1);
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
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = Math.random();
  const geom = new BufferGeometry();
  geom.setAttribute("position", new BufferAttribute(pos, 3));
  const points = new Points(
    geom,
    new PointsMaterial({
      color,
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  return { points, pos, seeds, curve, speed, spread };
}

export function tickStream(s: Stream, time: number, tmp: Vector3): void {
  const n = s.seeds.length;
  for (let i = 0; i < n; i++) {
    const seed = s.seeds[i] ?? 0;
    const u = (seed + time * s.speed) % 1;
    s.curve.getPointAt(u, tmp);
    const j = i * 3;
    const wobble = Math.sin(time * 7 + i) * s.spread;
    s.pos[j] = tmp.x + wobble;
    s.pos[j + 1] = tmp.y + Math.cos(time * 5 + i * 0.3) * s.spread;
    s.pos[j + 2] = tmp.z + Math.sin(time * 4 + i * 0.17) * s.spread;
  }
  const attr = s.points.geometry.getAttribute("position");
  attr.needsUpdate = true;
}
