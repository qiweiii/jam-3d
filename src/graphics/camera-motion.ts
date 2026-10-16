import { PerspectiveCamera, Vector3 } from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { easeOutCubic, slerpDir } from "./direction-math.ts";

type CameraControls = Pick<OrbitControls, "target" | "enabled" | "minDistance" | "maxDistance" | "update">;
export type CameraFrame = {
  position: Vector3;
  target: Vector3;
  minDist: number;
  maxDist: number;
};

/** Camera flights, manual dolly and resize preservation, independent of scene visibility and playback. */
export function createCameraMotion(camera: PerspectiveCamera, controls: CameraControls) {
  const fromPosition = camera.position.clone();
  const toPosition = camera.position.clone();
  const fromTarget = controls.target.clone();
  const toTarget = controls.target.clone();
  const fromDirection = new Vector3();
  const toDirection = new Vector3();
  const direction = new Vector3();
  let progress = 1;
  let duration = 0.95;
  let boundaryPressure = 0;
  let limits = { minDist: controls.minDistance, maxDist: controls.maxDistance };

  const finish = () => {
    controls.minDistance = limits.minDist;
    controls.maxDistance = limits.maxDist;
    controls.enabled = true;
    controls.update();
  };

  return {
    isMoving: () => progress < 1,

    flyTo(frame: CameraFrame, animate: boolean) {
      const startDistance = Math.max(0.08, camera.position.distanceTo(controls.target));
      const endDistance = Math.max(0.08, frame.position.distanceTo(frame.target));
      duration = Math.min(1.5, Math.max(0.55, 0.45 + Math.abs(Math.log(endDistance / startDistance)) * 0.18));
      fromPosition.copy(camera.position);
      fromTarget.copy(controls.target);
      toPosition.copy(frame.position);
      toTarget.copy(frame.target);
      limits = frame;
      boundaryPressure = 0;
      progress = animate ? 0 : 1;
      if (animate) {
        controls.enabled = false;
        controls.minDistance = 0.01;
        controls.maxDistance = 1e4;
      } else {
        camera.position.copy(toPosition);
        controls.target.copy(toTarget);
        finish();
      }
    },

    /** Returns the eased flight progress so the caller can synchronize scene fades. */
    update(dt: number): number | null {
      if (progress >= 1) return null;
      progress = Math.min(1, progress + dt / duration);
      const eased = easeOutCubic(progress);
      controls.target.lerpVectors(fromTarget, toTarget, eased);
      fromDirection.subVectors(fromPosition, fromTarget);
      toDirection.subVectors(toPosition, toTarget);
      const startDistance = Math.max(fromDirection.length(), 0.08);
      const endDistance = Math.max(toDirection.length(), 0.08);
      const distance = Math.exp(Math.log(startDistance) * (1 - eased) + Math.log(endDistance) * eased);
      slerpDir(fromDirection.normalize(), toDirection.normalize(), eased, direction);
      camera.position.copy(controls.target).addScaledVector(direction, distance);
      camera.lookAt(controls.target);
      if (progress >= 1) finish();
      return eased;
    },

    /** Returns a requested zoom-chain crossing; independent scenes only clamp at their limits. */
    dolly(amount: number, frame: CameraFrame, canCrossIn: boolean, canCrossOut: boolean): -1 | 0 | 1 {
      if (progress < 1 || amount === 0) return 0;
      const distance = camera.position.distanceTo(controls.target);
      let nextDistance = distance * Math.exp(-amount);
      if (nextDistance < frame.minDist) {
        nextDistance = frame.minDist;
        if (amount > 0 && canCrossIn) {
          boundaryPressure += amount;
          if (boundaryPressure > 0.25) return 1;
        }
      } else if (nextDistance > frame.maxDist) {
        nextDistance = frame.maxDist;
        if (amount < 0 && canCrossOut) {
          boundaryPressure -= amount;
          if (boundaryPressure > 0.25) return -1;
        }
      } else {
        boundaryPressure = 0;
      }
      direction.subVectors(controls.target, camera.position).setLength(distance - nextDistance);
      camera.position.add(direction);
      return 0;
    },

    resize(ratio: number, frame: CameraFrame) {
      // Preserve manual orbit and zoom, as well as both endpoints of an interrupted flight.
      camera.position.sub(controls.target).multiplyScalar(ratio).add(controls.target);
      fromPosition.sub(fromTarget).multiplyScalar(ratio).add(fromTarget);
      toPosition.sub(toTarget).multiplyScalar(ratio).add(toTarget);
      limits = frame;
      if (progress >= 1) finish();
    },
  };
}
