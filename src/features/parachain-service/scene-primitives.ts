import {
  BoxGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
} from "three";
import type { TermDefinition } from "../../content/term-definition";
import { attachBubble } from "../../ui/term-bubble";
import { createSceneLabel } from "../../graphics/scene-label";

export const HOST = 0xc87999;
export const CORE = 0x8c9cab;
export const PROTOCOL = 0x827da8;
export const READY = 0x8dceae;

export const glow = (color: number, opacity = 1) =>
  new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });

export const surface = (color: number, strength = 0.3) =>
  new MeshStandardMaterial({
    color: 0x11151b,
    emissive: color,
    emissiveIntensity: strength,
    roughness: 0.5,
    metalness: 0.2,
  });

export const curve = (points: number[][]) => new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));

/** Scene-local drawing and inspection helpers, shared by the host and its three example lanes. */
export function createScenePrimitives(group: Group, onInspect: () => void) {
  // CSS2D labels render over the scene; lifting them toward the camera causes visible parallax.
  const label = (title: string, meta: string, color: number, x: number, y: number, z = 0) => {
    const pin = createSceneLabel(title, meta, `#${color.toString(16).padStart(6, "0")}`, "parachain");
    pin.position.set(x, y, z);
    group.add(pin);
    return pin;
  };
  const inspect = (element: HTMLElement, spec: TermDefinition, title?: string) => {
    attachBubble(element, spec, title);
    element.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") onInspect();
    });
    element.addEventListener("focus", onInspect);
    element.addEventListener("click", onInspect);
  };
  const note = (pin: ReturnType<typeof label>, spec: TermDefinition) =>
    inspect(pin.element.querySelector<HTMLElement>(".tag-title")!, spec);
  const route = (path: CatmullRomCurve3, color: number) => {
    const mesh = new Mesh(new TubeGeometry(path, 32, 0.009, 6, false), glow(color, 0.22));
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
    const mesh = new Mesh(new CapsuleGeometry(radius, width - radius * 2, 6, 48), surface(color, 0.2));
    mesh.rotation.z = Math.PI / 2;
    mesh.position.y = y;
    group.add(mesh);
    return mesh;
  };
  return { label, inspect, note, route, rim, bar };
}

export type ScenePrimitives = ReturnType<typeof createScenePrimitives>;
