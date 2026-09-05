import { Color, InstancedMesh, LineSegments, Mesh, Points, Scene, Vector3 } from "three";
import { disposeBubbles, hideOpenBubbles } from "../ui/bubble";
import { frames, HOME_LOD, LODS, lodIndex, stepLod, type LodId } from "./views";
import { createNavigation } from "../ui/navigation";
import { createLearning } from "../ui/learning";
import { createJourneyControls } from "../ui/journey";
import { createJourneyPlayback } from "../experience/playback";
import { attachSceneInput } from "./input";
import { buildAnatomy } from "../scene/anatomy";
import { buildChain } from "../scene/chain";
import { buildJourney } from "../scene/journey";
import { buildMachine } from "../scene/machine";
import { easeOutCubic, slerpDir } from "../scene/math";
import { createStage } from "../scene/stage";
import { tickStream } from "../scene/streams";

export type Universe = {
  dispose: () => void;
};

export function createUniverse(host: HTMLElement): Universe {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = motion.matches;
  const scene = new Scene();
  scene.background = new Color(0x050506);
  const stage = createStage(host, scene, reduce);
  const { camera, renderer, labels, controls } = stage;

  const anatomy = buildAnatomy();
  scene.add(anatomy.group);
  const machine = buildMachine();
  scene.add(machine.group);
  const chain = buildChain();
  scene.add(chain.group);
  const journey = buildJourney();
  scene.add(journey.packet);

  let running = true;
  let last = performance.now();
  const tmp = new Vector3();
  const fromDir = new Vector3();
  const toDir = new Vector3();
  const flyDir = new Vector3();

  window.addEventListener("resize", stage.resize);
  stage.resize();

  const navigation = createNavigation(host, (id) => setLod(id, false));
  const learning = createLearning(host);
  const playback = createJourneyPlayback();
  const journeyControls = createJourneyControls(host, playback);
  const onMotionChange = () => {
    reduce = motion.matches;
    controls.enableDamping = !reduce;
    if (reduce) playback.play(false);
    setLod(lod, true);
  };
  motion.addEventListener("change", onMotionChange);

  let lod: LodId = HOME_LOD;
  let fly = 1;
  let flyDur = 0.95;
  const homeFrame = frames.find((f) => f.id === HOME_LOD);
  if (!homeFrame) throw new Error("missing home lod");
  const fromPos = homeFrame.position.clone();
  const toPos = homeFrame.position.clone();
  const fromTarget = homeFrame.target.clone();
  const toTarget = homeFrame.target.clone();
  let crossAccum = 0;
  const dollyDir = new Vector3();
  let outerFrom = 1;
  let outerTo = 1;
  let outer = 1;
  let tagsDirty = true;

  const outerAmount = (id: LodId): number => {
    if (id === "machine") return 1;
    if (id === "core") return 0.12;
    if (id === "package") return 0.1;
    return 0.04;
  };

  const applyOuter = (t: number) => {
    machine.ghostMat.opacity = 0.82 * t;
    machine.hullMat.opacity = 0.05 * t;
    machine.hullEdgeMat.opacity = 0.55 * t;
    machine.heroMat.opacity = 0.1 + 0.32 * t;
    for (const entry of machine.architectureMaterials) {
      entry.material.opacity = entry.opacity * t;
    }
    const show = t > 0.03;
    machine.ghosts.visible = show;
    machine.hull.visible = show;
    machine.hullEdges.visible = show;
    machine.heroShell.visible = true;
    machine.wallpaper.visible = t > 0.18;
    machine.architecture.visible = t > 0.18;
  };

  const setTagLod = (id: LodId) => {
    for (const el of host.querySelectorAll<HTMLElement>(".tag")) {
      const allow = (el.dataset.lod ?? "").split(",");
      el.classList.toggle("is-hidden", !allow.includes(id));
    }
    hideOpenBubbles();
  };

  const setLod = (next: LodId, instant: boolean) => {
    const previous = lod;
    lod = next;
    crossAccum = 0;
    const frame = frames.find((f) => f.id === next);
    if (!frame) return;
    fromPos.copy(camera.position);
    fromTarget.copy(controls.target);
    toPos.copy(frame.position);
    toTarget.copy(frame.target);
    const d0 = Math.max(0.08, fromPos.distanceTo(fromTarget));
    const d1 = Math.max(0.08, toPos.distanceTo(toTarget));
    flyDur = Math.min(1.5, Math.max(0.55, 0.45 + Math.abs(Math.log(d1 / d0)) * 0.18));
    const go = !(instant || reduce);
    fly = go ? 0 : 1;
    outerFrom = outer;
    outerTo = outerAmount(next);
    if (go) {
      controls.enabled = false;
      controls.minDistance = 0.01;
      controls.maxDistance = 1e4;
    } else {
      outer = outerTo;
      applyOuter(outer);
      camera.position.copy(toPos);
      controls.target.copy(toTarget);
      controls.enabled = true;
      controls.minDistance = frame.minDist;
      controls.maxDistance = frame.maxDist;
      controls.update();
    }
    anatomy.group.visible = next !== "machine";
    chain.group.visible = next === "package" || next === "block" || next === "stf";
    chain.stf.visible = next === "stf";
    const blockFocus = next === "block" || next === "stf";
    chain.currentBlock.visible = !blockFocus;
    chain.blockDetail.visible = blockFocus;
    journey.packet.visible = next === "package";
    navigation.update(next);
    journeyControls.setVisible(next === "package");
    if (next === "package") {
      if (previous !== "package") playback.restart();
      playback.play(!reduce);
    } else if (previous === "package") {
      playback.play(false);
    }
    setTagLod(next);
    tagsDirty = true;
    host.dataset.lod = next;
  };

  /** Continuous dolly along the view axis; pushing past a frame boundary crosses LODs. */
  const dollyBy = (amount: number) => {
    if (fly < 1 || amount === 0) return;
    const frame = frames.find((f) => f.id === lod);
    if (!frame) return;
    const dist = camera.position.distanceTo(controls.target);
    let next = dist * Math.exp(-amount);
    if (next < frame.minDist) {
      next = frame.minDist;
      if (amount > 0) {
        crossAccum += amount;
        if (crossAccum > 0.25 && lodIndex(lod) < LODS.length - 1) {
          setLod(stepLod(lod, 1), false);
          return;
        }
      }
    } else if (next > frame.maxDist) {
      next = frame.maxDist;
      if (amount < 0) {
        crossAccum -= amount;
        if (crossAccum > 0.25 && lodIndex(lod) > 0) {
          setLod(stepLod(lod, -1), false);
          return;
        }
      }
    } else {
      crossAccum = 0;
    }
    dollyDir.subVectors(controls.target, camera.position).setLength(dist - next);
    camera.position.add(dollyDir);
  };

  const detachInput = attachSceneInput(renderer.domElement, dollyBy, (delta) => setLod(stepLod(lod, delta), false));
  for (const stream of anatomy.streams) tickStream(stream, 0, tmp);

  setLod(HOME_LOD, true);

  const tick = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now * 0.001;
    if (fly < 1) {
      fly = Math.min(1, fly + dt / flyDur);
      const e = easeOutCubic(fly);
      controls.target.lerpVectors(fromTarget, toTarget, e);
      fromDir.subVectors(fromPos, fromTarget);
      toDir.subVectors(toPos, toTarget);
      const d0 = Math.max(fromDir.length(), 0.08);
      const d1 = Math.max(toDir.length(), 0.08);
      const dist = Math.exp(Math.log(d0) * (1 - e) + Math.log(d1) * e);
      slerpDir(fromDir.normalize(), toDir.normalize(), e, flyDir);
      camera.position.copy(controls.target).addScaledVector(flyDir, dist);
      camera.lookAt(controls.target);
      outer = outerFrom + (outerTo - outerFrom) * e;
      applyOuter(outer);
      if (fly >= 1) {
        const frame = frames.find((f) => f.id === lod);
        if (frame) {
          controls.minDistance = frame.minDist;
          controls.maxDistance = frame.maxDist;
        }
        controls.enabled = true;
        controls.update();
      }
    }
    if (!reduce) {
      const pulse = 1 + Math.sin(t * 2.1) * 0.025;
      anatomy.body.scale.set(1.85 * pulse, 1.15 * pulse, 1.25 * pulse);
      anatomy.outline.scale.copy(anatomy.body.scale).multiplyScalar(1.045);
      anatomy.store.rotation.y += dt * 0.35;
    }
    if (!reduce && anatomy.group.visible) {
      for (const stream of anatomy.streams) tickStream(stream, t, tmp);
    }
    if (lod === "package") {
      playback.tick(dt);
      journey.update(playback.snapshot(), reduce);
      journeyControls.render();
    }
    if (controls.enabled) controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
    if (tagsDirty) {
      setTagLod(lod);
      tagsDirty = false;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return {
    dispose: () => {
      running = false;
      window.removeEventListener("resize", stage.resize);
      detachInput();
      motion.removeEventListener("change", onMotionChange);
      disposeBubbles(host);
      scene.traverse((object) => {
        if ("element" in object && object.element instanceof HTMLElement) disposeBubbles(object.element);
      });
      renderer.dispose();
      renderer.domElement.remove();
      labels.domElement.remove();
      navigation.dispose();
      learning.dispose();
      journeyControls.dispose();
      controls.dispose();
      scene.traverse((obj) => {
        if (
          obj instanceof Mesh ||
          obj instanceof Points ||
          obj instanceof InstancedMesh ||
          obj instanceof LineSegments
        ) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) {
            for (const material of m) material.dispose();
          } else m.dispose();
        }
      });
    },
  };
}
