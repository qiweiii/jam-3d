import { MeshStandardMaterial, type MeshStandardMaterialParameters } from "three";

/** Shared MSAA coverage keeps overlapping pieces seamless, without ordinary alpha blending. */
export function createCoreShell(parameters: MeshStandardMaterialParameters) {
  const material = new MeshStandardMaterial({ ...parameters, alphaToCoverage: true });
  return {
    material,
    setCutaway: (enabled: boolean) => {
      material.opacity = enabled ? 0.35 : 1;
    },
  };
}
