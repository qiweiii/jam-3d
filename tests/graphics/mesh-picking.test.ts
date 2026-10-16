import assert from "node:assert/strict";
import test from "node:test";
import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera } from "three";
import { attachMeshPicking } from "../../src/graphics/mesh-picking.ts";

test("service meshes open on click, but not on orbit drags, cancelled touches or in other scenes", () => {
  const canvas = Object.assign(new EventTarget(), {
    style: { cursor: "" },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
  });
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 5;
  camera.updateMatrixWorld();
  const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  mesh.updateMatrixWorld();
  let active = true;
  let opened = 0;
  const detach = attachMeshPicking(
    canvas as unknown as HTMLCanvasElement,
    camera,
    mesh,
    () => active,
    () => opened++,
  );
  const pointer = (type: string, x = 50, y = 50) => {
    canvas.dispatchEvent(
      Object.assign(new Event(type), {
        clientX: x,
        clientY: y,
        pointerId: 1,
        isPrimary: true,
        button: 0,
        buttons: type === "pointermove" ? 1 : 0,
      }),
    );
  };
  pointer("pointerdown");
  pointer("pointerup");
  assert.equal(opened, 1);
  pointer("pointerdown");
  pointer("pointermove", 60);
  pointer("pointermove", 50);
  pointer("pointerup");
  assert.equal(opened, 1);
  pointer("pointerdown");
  pointer("pointercancel");
  pointer("pointerup");
  assert.equal(opened, 1);
  active = false;
  pointer("pointerdown");
  pointer("pointerup");
  assert.equal(opened, 1);
  active = true;
  detach();
  pointer("pointerdown");
  pointer("pointerup");
  assert.equal(opened, 1);
  mesh.geometry.dispose();
  mesh.material.dispose();
});
