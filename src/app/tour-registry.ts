import { PACKAGE_STEPS } from "../features/package-tour/package-steps";
import { PARACHAIN_STEPS } from "../features/parachain-service/parachain-steps";
import { createServiceHeader } from "../features/parachain-service/service-header";
import { WHY_STEPS } from "../features/why-jam/why-steps";
import { createTourPlayback } from "../playback/tour-playback";
import { createTourControls } from "../ui/tour-controls";
import type { ViewId } from "./view-catalog";

/** Owns tour clocks and their panels; scene builders only consume playback snapshots. */
export function createTourRegistry(host: HTMLElement, navigate: (id: ViewId) => void) {
  const packagePlayback = createTourPlayback(PACKAGE_STEPS, { loop: true });
  const whyPlayback = createTourPlayback(WHY_STEPS);
  const parachainPlayback = createTourPlayback(PARACHAIN_STEPS);
  const tours = {
    package: {
      playback: packagePlayback,
      controls: createTourControls(host, packagePlayback, PACKAGE_STEPS, {
        caption: "One package · Across blocks · Successful path",
        label: "Work package journey",
        showProgress: true,
      }),
      autoplay: true,
      lastIndex: -1,
    },
    why: {
      playback: whyPlayback,
      controls: createTourControls(host, whyPlayback, WHY_STEPS, {
        caption: "Why JAM · Scale meets coherency",
        label: "Why JAM tour",
        showPlay: false,
        replayAtEnd: true,
        finish: { text: "Finish", onSelect: () => navigate("machine") },
      }),
      autoplay: false,
      lastIndex: -1,
    },
    parachain: {
      playback: parachainPlayback,
      controls: createTourControls(host, parachainPlayback, PARACHAIN_STEPS, {
        label: "Parachain Service flow",
        showProgress: true,
        replayAtEnd: true,
        hideNextAtEnd: true,
      }),
      autoplay: true,
      lastIndex: -1,
    },
  };
  const header = createServiceHeader(host, () => navigate("machine"));
  const tourFor = (id: ViewId) => (id === "package" || id === "why" || id === "parachain" ? tours[id] : null);

  return {
    ...tours,
    setView(next: ViewId, previous: ViewId, reduce: boolean) {
      for (const [id, tour] of Object.entries(tours)) {
        tour.controls.setVisible(id === next);
        if (id === next) {
          if (previous !== next) {
            tour.playback.restart();
            if (next === "why") tour.lastIndex = -1;
          }
          tour.playback.play(tour.autoplay && !reduce);
        } else if (id === previous) tour.playback.play(false);
      }
      header.setVisible(next === "parachain");
    },
    stepNumber: (id: ViewId) => {
      const tour = tourFor(id);
      return tour ? tour.playback.snapshot().index + 1 : null;
    },
    selectStep: (id: ViewId, step: number) => tourFor(id)?.playback.select(step - 1),
    pause(id: ViewId) {
      const tour = tourFor(id);
      tour?.playback.play(false);
      tour?.controls.render();
    },
    pauseAll() {
      for (const tour of Object.values(tours)) tour.playback.play(false);
    },
    /** Advance one tour and report step changes for URL and camera synchronization. */
    update(id: ViewId, dt: number, reduce: boolean): boolean {
      const tour = tourFor(id);
      if (!tour) return false;
      const before = tour.playback.snapshot();
      if (id === "parachain" && reduce && !before.scrubbed) tour.playback.seek(before.step.duration);
      tour.playback.tick(dt);
      tour.controls.render();
      const index = tour.playback.snapshot().index;
      const changed = index !== tour.lastIndex;
      tour.lastIndex = index;
      return changed;
    },
    dispose() {
      for (const tour of Object.values(tours)) tour.controls.dispose();
      header.dispose();
    },
  };
}
