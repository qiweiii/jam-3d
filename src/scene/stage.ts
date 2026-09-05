import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { frames, HOME_LOD } from "../experience/views";

export type Stage = {
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  labels: CSS2DRenderer;
  controls: OrbitControls;
  resize: () => void;
};

/** Camera, renderers, lights, orbit controls: everything the tick loop drives. */
export function createStage(host: HTMLElement, scene: Scene, reduce: boolean): Stage {
  const camera = new PerspectiveCamera(38, 1, 0.03, 200);
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050506, 1);
  host.prepend(renderer.domElement);

  const labels = new CSS2DRenderer();
  labels.domElement.className = "labels";
  host.appendChild(labels.domElement);

  scene.add(new AmbientLight(0x8899aa, 0.28));
  const key = new DirectionalLight(0xffe6c8, 1.05);
  key.position.set(-10, 8, 12);
  scene.add(key);
  const fill = new DirectionalLight(0x5ec8e8, 0.4);
  fill.position.set(8, -2, 6);
  scene.add(fill);

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labels.setSize(w, h);
  };

  const homeFrame = frames.find((f) => f.id === HOME_LOD);
  if (!homeFrame) throw new Error("missing home lod");
  camera.position.copy(homeFrame.position);
  camera.lookAt(homeFrame.target);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(homeFrame.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = true;
  if (reduce) controls.enableDamping = false;

  return { camera, renderer, labels, controls, resize };
}
