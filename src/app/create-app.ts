import { Color, Scene } from "three";
import { buildBlockVisuals } from "../features/block/block-visuals";
import { buildCoreVisuals } from "../features/core/core-visuals";
import { buildMachineVisuals } from "../features/machine/machine-visuals";
import { buildPackageVisuals } from "../features/package-tour/package-visuals";
import { deriveParachainPose } from "../features/parachain-service/parachain-pose";
import { buildParachainServiceVisuals } from "../features/parachain-service/parachain-service-visuals";
import { buildWhyVisuals } from "../features/why-jam/why-visuals";
import { createCameraMotion } from "../graphics/camera-motion";
import { attachCanvasInput } from "../graphics/canvas-input";
import { disposeResources } from "../graphics/dispose-resources";
import { attachMeshPicking } from "../graphics/mesh-picking";
import { createViewport } from "../graphics/viewport";
import { createNavigation } from "../ui/navigation";
import { disposeBubbles, hideOpenBubbles } from "../ui/term-bubble";
import { CAMERA_PRESETS, cameraScale, frameForViewport, type CameraPreset } from "./camera-presets";
import { parseRoute, routeHash } from "./routes";
import { createTourRegistry } from "./tour-registry";
import { HOME_VIEW, ZOOM_VIEWS, viewIndex, stepView, type ViewId } from "./view-catalog";

export type App = { dispose: () => void };

/** Composition root: connect feature APIs, navigation and one render loop. */
export function createApp(host: HTMLElement): App {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motion.matches;
  const scene = new Scene();
  scene.background = new Color(0x050506);
  const homeCamera = CAMERA_PRESETS.find((preset) => preset.id === HOME_VIEW);
  if (!homeCamera) throw new Error("missing home camera preset");
  const viewport = createViewport(host, scene, {
    reduceMotion,
    initialCamera: homeCamera,
    farForViewport: (width, height) =>
      200 * Math.max(...CAMERA_PRESETS.map((preset) => cameraScale(preset.id, width, height))),
  });
  const { camera, renderer, labels, controls } = viewport;

  // Keep construction order stable, including the seeded decorative streams.
  const core = buildCoreVisuals();
  scene.add(core.group);
  const machine = buildMachineVisuals(() => setView("parachain", false));
  scene.add(machine.group);
  const block = buildBlockVisuals();
  scene.add(block.group);
  const packageVisuals = buildPackageVisuals();
  scene.add(packageVisuals.group);
  const why = buildWhyVisuals();
  scene.add(why.group);
  const parachain = buildParachainServiceVisuals(() => tours.pause("parachain"));
  scene.add(parachain.group);

  let running = true;
  let animationFrame = 0;
  let last = performance.now();
  const cameraMotion = createCameraMotion(camera, controls);
  viewport.resize();
  let viewportWidth = host.clientWidth;
  let viewportHeight = host.clientHeight;
  parachain.resize(viewportWidth, viewportHeight);
  const getCameraPreset = (id: ViewId) => {
    const preset = CAMERA_PRESETS.find((candidate) => candidate.id === id);
    return preset ? frameForViewport(preset, viewportWidth, viewportHeight) : undefined;
  };

  const navigation = createNavigation(host, (id) => setView(id, false));
  const tours = createTourRegistry(host, (id) => setView(id, false));
  const initialRoute = parseRoute(location.hash);
  let view = initialRoute.view;
  let overviewFrom = 1;
  let overviewTo = 1;
  let overviewOpacity = 1;
  let whyFrom = 0;
  let whyTo = 0;
  let whyOpacity = 0;
  let labelsDirty = true;

  const updateUrl = () => history.replaceState(null, "", routeHash(view, tours.stepNumber(view)));
  const overviewAmount = (id: ViewId): number => {
    if (id === "machine") return 1;
    if (id === "core") return 0.12;
    if (id === "package") return 0.1;
    if (id === "why" || id === "parachain") return 0;
    return 0.04;
  };
  const setLabelView = (id: ViewId) => {
    for (const element of host.querySelectorAll<HTMLElement>(".tag")) {
      const visibleIn = (element.dataset.lod ?? "").split(",");
      element.classList.toggle("is-hidden", !visibleIn.includes(id));
    }
    hideOpenBubbles();
  };
  const applySceneFade = (progress: number) => {
    overviewOpacity = overviewFrom + (overviewTo - overviewFrom) * progress;
    machine.setOverviewOpacity(overviewOpacity);
    whyOpacity = whyFrom + (whyTo - whyFrom) * progress;
    why.setOpacity(whyOpacity);
  };
  const beginFly = (preset: CameraPreset, animate: boolean) => {
    cameraMotion.flyTo(preset, animate);
    if (!animate) applySceneFade(1);
  };

  const setView = (next: ViewId, instant: boolean) => {
    const previous = view;
    view = next;
    renderer.domElement.style.cursor = "";
    const preset = getCameraPreset(next);
    if (!preset) return;
    overviewFrom = overviewOpacity;
    overviewTo = overviewAmount(next);
    whyFrom = whyOpacity;
    whyTo = next === "why" ? 1 : 0;
    beginFly(preset, !(instant || reduceMotion));
    machine.group.visible = next !== "parachain";
    core.group.visible = next !== "machine" && next !== "why" && next !== "parachain";
    core.setCutaway(next === "package");
    block.group.visible = next === "package" || next === "block" || next === "stf";
    block.setFocus(next === "block" || next === "stf" ? next : null);
    packageVisuals.group.visible = next === "package";
    if (next !== "package") block.updateRail(null);
    navigation.update(next);
    parachain.group.visible = next === "parachain";
    tours.setView(next, previous, reduceMotion);
    setLabelView(next);
    labelsDirty = true;
    // Keep existing CSS hooks and shareable URLs stable during internal renames.
    host.dataset.lod = next;
    updateUrl();
  };

  const onMotionChange = () => {
    reduceMotion = motion.matches;
    controls.enableDamping = !reduceMotion;
    if (reduceMotion) tours.pauseAll();
    setView(view, true);
  };
  const onResize = () => {
    const previousScale = cameraScale(view, viewportWidth, viewportHeight);
    viewportWidth = host.clientWidth;
    viewportHeight = host.clientHeight;
    viewport.resize();
    parachain.resize(viewportWidth, viewportHeight);
    const ratio = cameraScale(view, viewportWidth, viewportHeight) / previousScale;
    const preset = getCameraPreset(view);
    if (preset) cameraMotion.resize(ratio, preset);
  };
  const onHashChange = () => {
    const route = parseRoute(location.hash);
    if (route.view !== view) setView(route.view, false);
    if (route.step != null) tours.selectStep(view, route.step);
  };
  motion.addEventListener("change", onMotionChange);
  window.addEventListener("resize", onResize);
  window.addEventListener("hashchange", onHashChange);
  const dollyBy = (amount: number) => {
    const preset = getCameraPreset(view);
    if (!preset) return;
    const index = viewIndex(view);
    const crossing = cameraMotion.dolly(amount, preset, index >= 0 && index < ZOOM_VIEWS.length - 1, index > 0);
    if (crossing) setView(stepView(view, crossing), false);
  };
  const detachInput = attachCanvasInput(renderer.domElement, dollyBy, (delta) => setView(stepView(view, delta), false));
  const detachServiceLink = attachMeshPicking(
    renderer.domElement,
    camera,
    machine.serviceEntry,
    () => view === "machine" && !cameraMotion.isMoving(),
    () => setView("parachain", false),
  );
  setView(initialRoute.view, true);
  if (initialRoute.step != null) tours.selectStep(view, initialRoute.step);

  const tick = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const time = now * 0.001;
    const flightProgress = cameraMotion.update(dt);
    if (flightProgress != null) applySceneFade(flightProgress);
    core.updateAmbient(time, dt, reduceMotion);
    const stepChanged = tours.update(view, dt, reduceMotion);
    if (stepChanged) updateUrl();
    if (view === "package") {
      const pose = packageVisuals.update(tours.package.playback.snapshot(), reduceMotion);
      block.updateRail({ advance: pose.blockAdvance, pendingRecorded: pose.recorded, accumulation: pose.accumulation });
    }
    if (view === "why") {
      if (stepChanged) {
        const { index } = tours.why.playback.snapshot();
        const stop = why.stopFrames[index]!;
        beginFly(
          {
            ...getCameraPreset("why")!,
            target: stop.target,
            position: stop.target.clone().lerp(stop.position, cameraScale("why", viewportWidth, viewportHeight)),
          },
          !reduceMotion,
        );
      }
      if (why.group.visible && !reduceMotion) why.update(time);
    }
    if (view === "parachain") {
      const snapshot = tours.parachain.playback.snapshot();
      parachain.update(deriveParachainPose(snapshot.step, snapshot.elapsed, reduceMotion && !snapshot.scrubbed));
    }
    if (controls.enabled) controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
    if (labelsDirty) {
      setLabelView(view);
      labelsDirty = false;
    }
    animationFrame = requestAnimationFrame(tick);
  };
  animationFrame = requestAnimationFrame(tick);

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onHashChange);
      motion.removeEventListener("change", onMotionChange);
      detachInput();
      detachServiceLink();
      disposeBubbles(host);
      scene.traverse((object) => {
        if ("element" in object && object.element instanceof HTMLElement) disposeBubbles(object.element);
      });
      renderer.dispose();
      renderer.domElement.remove();
      labels.domElement.remove();
      navigation.dispose();
      tours.dispose();
      controls.dispose();
      disposeResources(scene);
    },
  };
}
