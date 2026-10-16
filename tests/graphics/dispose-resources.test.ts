import assert from "node:assert/strict";
import test from "node:test";
import { BoxGeometry, Group, InstancedMesh, Line, LineSegments, Mesh, MeshBasicMaterial, Points } from "three";
import { disposeResources } from "../../src/graphics/dispose-resources.ts";

test("scene cleanup disposes shared resources once across meshes, points and lines", () => {
  const root = new Group();
  const sharedGeometry = new BoxGeometry();
  const sharedMaterial = new MeshBasicMaterial();
  const lineGeometry = new BoxGeometry();
  const lineMaterial = new MeshBasicMaterial();
  const counts = { sharedGeometry: 0, sharedMaterial: 0, lineGeometry: 0, lineMaterial: 0 };
  sharedGeometry.addEventListener("dispose", () => counts.sharedGeometry++);
  sharedMaterial.addEventListener("dispose", () => counts.sharedMaterial++);
  lineGeometry.addEventListener("dispose", () => counts.lineGeometry++);
  lineMaterial.addEventListener("dispose", () => counts.lineMaterial++);
  root.add(
    new Mesh(sharedGeometry, [sharedMaterial, sharedMaterial]),
    new Points(sharedGeometry, sharedMaterial),
    new InstancedMesh(sharedGeometry, sharedMaterial, 1),
    new LineSegments(sharedGeometry, sharedMaterial),
    new Line(lineGeometry, lineMaterial),
  );
  disposeResources(root);
  assert.deepEqual(counts, { sharedGeometry: 1, sharedMaterial: 1, lineGeometry: 1, lineMaterial: 1 });
});
