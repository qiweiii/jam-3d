import { Raycaster, Vector2, type Camera, type Object3D } from "three";

/** A mesh can be a scene entry without treating an orbit drag as a click. */
export function attachMeshPicking(
  canvas: HTMLCanvasElement,
  camera: Camera,
  target: Object3D,
  enabled: () => boolean,
  onSelect: () => void,
) {
  const events = new AbortController();
  const ray = new Raycaster();
  const pointer = new Vector2();
  let press: { x: number; y: number; id: number } | null = null;
  const hit = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      1 - ((event.clientY - bounds.top) / bounds.height) * 2,
    );
    ray.setFromCamera(pointer, camera);
    return ray.intersectObject(target, true).length > 0;
  };
  canvas.addEventListener(
    "pointerdown",
    (event) => {
      if (enabled() && event.isPrimary && event.button === 0 && hit(event)) {
        press = { x: event.clientX, y: event.clientY, id: event.pointerId };
      } else press = null;
    },
    { signal: events.signal },
  );
  canvas.addEventListener(
    "pointermove",
    (event) => {
      if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 5) press = null;
      canvas.style.cursor = enabled() && event.buttons === 0 && hit(event) ? "pointer" : "";
    },
    { signal: events.signal },
  );
  canvas.addEventListener(
    "pointerup",
    (event) => {
      const activate =
        press?.id === event.pointerId &&
        Math.hypot(event.clientX - press.x, event.clientY - press.y) <= 5 &&
        enabled() &&
        hit(event);
      press = null;
      if (activate) onSelect();
    },
    { signal: events.signal },
  );
  canvas.addEventListener(
    "pointercancel",
    () => {
      press = null;
    },
    { signal: events.signal },
  );
  canvas.addEventListener(
    "pointerleave",
    () => {
      canvas.style.cursor = "";
    },
    { signal: events.signal },
  );
  return () => {
    events.abort();
    canvas.style.cursor = "";
  };
}
