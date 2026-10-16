import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { JAM_STATE_COMPONENTS } from "../../content/jam-state.ts";
import { STATE_DISC_HEIGHT, STATE_DISC_RADIUS, stateComponentY } from "../../world/layout.ts";

type StateSymbol = (typeof JAM_STATE_COMPONENTS)[number]["symbol"];

/** The same state inventory, order and proportions as the Block view, enlarged for this scene. */
export function buildStateCylinder(scale = 20) {
  const group = new Group();
  group.name = "JAM state";
  const radius = STATE_DISC_RADIUS * scale;
  const geometry = new CylinderGeometry(radius, radius, STATE_DISC_HEIGHT * scale, 32);
  const layers = JAM_STATE_COMPONENTS.map((component) => {
    const material = new MeshStandardMaterial({
      color: 0x12151b,
      emissive: component.color,
      emissiveIntensity: 0.12,
      roughness: 0.35,
      metalness: 0.2,
    });
    const disc = new Mesh(geometry, material);
    disc.name = component.symbol;
    disc.position.y = stateComponentY(component.symbol) * scale;
    group.add(disc);
    return disc;
  });
  const point = (symbol: StateSymbol) => new Vector3(0, stateComponentY(symbol) * scale, radius);
  const highlight = (symbol: StateSymbol, intensity: number) => {
    for (const layer of layers) layer.material.emissiveIntensity = layer.name === symbol ? intensity : 0.12;
  };
  return { group, layers, radius, point, highlight };
}
