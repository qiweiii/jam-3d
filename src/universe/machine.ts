import {
  BoxGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  RingGeometry,
  SphereGeometry,
  Vector3,
} from "three";
import { wrapTerm } from "../bubble";
import { HERO, NOW_BLOCK } from "../lod";
import { TERMS } from "../refs";
import { tag } from "./tag";

export type Machine = {
  group: Group;
  wallpaper: Group;
  hull: Mesh;
  hullEdges: LineSegments;
  ghosts: InstancedMesh;
  ghostMat: MeshStandardMaterial;
  hullMat: MeshBasicMaterial;
  hullEdgeMat: LineBasicMaterial;
  heroMat: MeshStandardMaterial;
  heroShell: Mesh;
};

/** The whole JAM at machine scale: hull, ghost cores, hero shell, wallpaper rings. */
export function buildMachine(): Machine {
  const group = new Group();

  const wallpaper = new Group();
  wallpaper.position.z = -18;
  for (let i = 0; i < 16; i++) {
    const r = 2.2 + i * 1.35;
    const ring = new Mesh(
      new RingGeometry(r, r + 0.045, 72),
      new MeshBasicMaterial({
        color: 0x12141a,
        transparent: true,
        opacity: 0.55,
        side: DoubleSide,
      }),
    );
    ring.position.set((i % 4) * 7 - 10, ((i * 3) % 5) * 4 - 8, 0);
    wallpaper.add(ring);
  }
  group.add(wallpaper);

  const hullW = 24;
  const hullH = 16;
  const hullD = 24;
  const hullGeom = new BoxGeometry(hullW, hullH, hullD);
  const hullMat = new MeshBasicMaterial({
    color: 0x8aa4bc,
    transparent: true,
    opacity: 0.05,
    side: DoubleSide,
    depthWrite: false,
  });
  const hull = new Mesh(hullGeom, hullMat);
  hull.position.set(1, -0.2, 0.4);
  const hullEdgeMat = new LineBasicMaterial({ color: 0x6a8498, transparent: true, opacity: 0.55 });
  const hullEdges = new LineSegments(new EdgesGeometry(hullGeom), hullEdgeMat);
  hullEdges.position.copy(hull.position);
  group.add(hull);
  group.add(hullEdges);

  const heroMat = new MeshStandardMaterial({
    color: 0x1c2226,
    emissive: 0x8a9088,
    emissiveIntensity: 0.45,
    roughness: 0.5,
    metalness: 0.18,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  // Core chamber: a round ball over kidney + refine only; store, state and streams flow outside it.
  const heroShell = new Mesh(new SphereGeometry(0.33, 32, 32), heroMat);
  heroShell.position.copy(HERO).add(new Vector3(0.08, 0, 0));
  group.add(heroShell);

  const dummy = new Object3D();

  /** Radial push-out: guarantees `dummy` sits at least `minDist` from `center` (no overlaps). */
  const pushOut = (center: Vector3, minDist: number) => {
    if (dummy.position.distanceTo(center) >= minDist) return;
    dummy.position.sub(center).setLength(minDist).add(center);
  };
  const ghostGeom = new SphereGeometry(0.28, 10, 10);
  const ghostMat = new MeshStandardMaterial({
    color: 0x1c2226,
    emissive: 0x8a9088,
    emissiveIntensity: 0.42,
    roughness: 0.5,
    metalness: 0.18,
    transparent: true,
    opacity: 0.82,
  });
  const coreCount = 96;
  const ghosts = new InstancedMesh(ghostGeom, ghostMat, coreCount);
  const q = new Quaternion();
  for (let i = 0; i < coreCount; i++) {
    dummy.position.set(
      hull.position.x + (Math.random() - 0.5) * (hullW - 5),
      hull.position.y + (Math.random() - 0.5) * (hullH - 5),
      hull.position.z + (Math.random() - 0.5) * (hullD - 5),
    );
    pushOut(HERO, 3.6);
    pushOut(NOW_BLOCK, 3.6);
    dummy.scale.setScalar(0.55 + (i % 5) * 0.12);
    dummy.setRotationFromQuaternion(q);
    dummy.updateMatrix();
    ghosts.setMatrixAt(i, dummy.matrix);
  }
  group.add(ghosts);

  const fieldTag = tag("cores", "341", "#c8c4bc", "machine");
  fieldTag.position.set(hull.position.x + 6.5, hull.position.y + 1.1, hull.position.z);
  group.add(fieldTag);
  const daTag = tag("DA", "data lake", "#b8c0c8", "machine");
  daTag.position.set(hull.position.x - 5.5, hull.position.y + 2.4, hull.position.z);
  group.add(daTag);
  wrapTerm(daTag.element.querySelector(".tag-title") ?? daTag.element, "DA", TERMS.da);
  wrapTerm(fieldTag.element.querySelector(".tag-title") ?? fieldTag.element, "cores", TERMS.cores);

  return {
    group,
    wallpaper,
    hull,
    hullEdges,
    ghosts,
    ghostMat,
    hullMat,
    hullEdgeMat,
    heroMat,
    heroShell,
  };
}
