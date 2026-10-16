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
import { wrapTerm } from "../ui/bubble";
import { HERO, NOW_BLOCK } from "./layout";
import { TERMS } from "../content/references";
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
  architecture: Group;
  parachainCartridge: Mesh;
  architectureMaterials: Array<{
    material: MeshBasicMaterial | MeshStandardMaterial;
    opacity: number;
  }>;
};

/** The whole JAM at machine scale: hull, ghost cores, hero shell, wallpaper rings. */
export function buildMachine(onParachainSelect: () => void): Machine {
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
      hull.position.y - 3.4 + (Math.random() - 0.5) * 8,
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

  const architecture = new Group();
  const architectureMaterials: Array<{
    material: MeshBasicMaterial | MeshStandardMaterial;
    opacity: number;
  }> = [];
  const rememberOpacity = <T extends MeshBasicMaterial | MeshStandardMaterial>(material: T, opacity: number) => {
    architectureMaterials.push({ material, opacity });
    return material;
  };

  const userlandMat = rememberOpacity(
    new MeshBasicMaterial({
      color: 0x4a3540,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    }),
    0.15,
  );
  const userland = new Mesh(new BoxGeometry(hullW, 5.0, hullD), userlandMat);
  userland.position.set(hull.position.x, hull.position.y + 5.5, hull.position.z);
  architecture.add(userland);
  const kernelMat = rememberOpacity(
    new MeshBasicMaterial({
      color: 0x2c2a54,
      transparent: true,
      opacity: 0.17,
      depthWrite: false,
    }),
    0.17,
  );
  const kernel = new Mesh(new BoxGeometry(hullW, 2.1, hullD), kernelMat);
  kernel.position.set(hull.position.x, hull.position.y + 1.95, hull.position.z);
  architecture.add(kernel);
  const hardwareMat = rememberOpacity(
    new MeshBasicMaterial({
      color: 0x1c3242,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
    0.16,
  );
  const hardware = new Mesh(new BoxGeometry(hullW, 8.9, hullD), hardwareMat);
  hardware.position.set(hull.position.x, hull.position.y - 3.55, hull.position.z);
  architecture.add(hardware);
  const serviceGeom = new BoxGeometry(4, 0.78, 3);
  const services = [
    { title: "Parachain Service", x: hull.position.x - 6, color: 0xe45a88 },
    { title: "Service A", x: hull.position.x, color: 0xd6b45f },
    { title: "Service B", x: hull.position.x + 6, color: 0x69c99b },
  ] as const;
  let parachainCartridge: Mesh | undefined;
  for (const service of services) {
    const material = rememberOpacity(
      new MeshStandardMaterial({
        color: 0x17151b,
        emissive: service.color,
        emissiveIntensity: 0.34,
        roughness: 0.36,
        metalness: 0.24,
        transparent: true,
        opacity: 0.88,
      }),
      0.88,
    );
    const cartridge = new Mesh(serviceGeom, material);
    cartridge.position.set(service.x, hull.position.y + 5.5, hull.position.z);
    architecture.add(cartridge);
    const serviceTag = tag(service.title, "", `#${service.color.toString(16).padStart(6, "0")}`, "machine");
    if (service.title === "Parachain Service") {
      parachainCartridge = cartridge;
      serviceTag.element.innerHTML =
        '<button type="button" class="service-entry" aria-label="Explore Parachain Service"><span class="tag-title">Parachain Service</span><span class="tag-title" aria-hidden="true">↗</span></button>';
      serviceTag.element.querySelector("button")!.addEventListener("click", onParachainSelect);
    }
    serviceTag.position.set(service.x, hull.position.y + 6.2, hull.position.z);
    architecture.add(serviceTag);
  }

  const userlandTag = tag("Userland", "", "#e8d9c5", "machine");
  userlandTag.position.set(hull.position.x + 10.2, hull.position.y + 5.5, hull.position.z);
  architecture.add(userlandTag);

  const hardwareTag = tag("Hardware", "", "#8eb6c9", "machine");
  hardwareTag.position.set(hull.position.x + 10.2, hull.position.y - 2.3, hull.position.z);
  architecture.add(hardwareTag);

  const kernelTag = tag("Kernel", "", "#a99cff", "machine");
  kernelTag.position.set(hull.position.x + 10.2, hull.position.y + 1.95, hull.position.z);
  architecture.add(kernelTag);

  const protocolTag = tag("JAM protocol", "", "#a99cff", "machine");
  protocolTag.position.set(hull.position.x, hull.position.y + 1.95, hull.position.z);
  architecture.add(protocolTag);

  group.add(architecture);

  const fieldTag = tag("Cores", "341", "#c8c4bc", "machine");
  fieldTag.position.set(hull.position.x + 6.5, hull.position.y - 0.7, hull.position.z);
  group.add(fieldTag);
  const daTag = tag("DA", "Data lake", "#b8c0c8", "machine");
  daTag.position.set(hull.position.x - 6.5, hull.position.y - 1.5, hull.position.z);
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
    architecture,
    parachainCartridge: parachainCartridge!,
    architectureMaterials,
  };
}
