import { JOURNEY_STEPS } from "../content/journey.ts";

export function createJourneyPlayback() {
  let index = 0;
  let elapsed = 0;
  let playing = false;
  const snapshot = () => ({ index, elapsed, playing, step: JOURNEY_STEPS[index]! });
  const select = (next: number) => {
    index = Math.max(0, Math.min(JOURNEY_STEPS.length - 1, next));
    elapsed = 0;
  };
  return {
    snapshot,
    select,
    play(value: boolean) {
      playing = value;
    },
    restart() {
      select(0);
    },
    tick(dt: number) {
      if (!playing) return;
      elapsed += Math.max(0, dt);
      while (elapsed >= JOURNEY_STEPS[index]!.duration) {
        if (index === JOURNEY_STEPS.length - 1) {
          elapsed = JOURNEY_STEPS[index]!.duration;
          playing = false;
          break;
        }
        elapsed -= JOURNEY_STEPS[index]!.duration;
        index++;
      }
    },
  };
}

export type JourneyPlayback = ReturnType<typeof createJourneyPlayback>;
