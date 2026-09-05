import { JOURNEY_STEPS } from "../content/journey.ts";

export type PlaybackStep = { duration: number };

export type PlaybackSnapshot<T extends PlaybackStep> = {
  index: number;
  elapsed: number;
  playing: boolean;
  step: T;
};

export type JourneyPlayback<T extends PlaybackStep = PlaybackStep> = {
  snapshot: () => PlaybackSnapshot<T>;
  select: (next: number) => void;
  play: (value: boolean) => void;
  restart: () => void;
  tick: (dt: number) => void;
};

export type JourneyStep = (typeof JOURNEY_STEPS)[number];

/** Clockwork for a captioned stop sequence; defaults to the package journey. */
export function createJourneyPlayback(): JourneyPlayback<JourneyStep>;
export function createJourneyPlayback<T extends PlaybackStep>(steps: readonly T[]): JourneyPlayback<T>;
export function createJourneyPlayback(steps?: readonly PlaybackStep[]): JourneyPlayback<PlaybackStep> {
  const list: readonly PlaybackStep[] = steps ?? JOURNEY_STEPS;
  let index = 0;
  let elapsed = 0;
  let playing = false;
  const snapshot = () => ({ index, elapsed, playing, step: list[index]! });
  const select = (next: number) => {
    index = Math.max(0, Math.min(list.length - 1, next));
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
      while (elapsed >= list[index]!.duration) {
        if (index === list.length - 1) {
          elapsed = list[index]!.duration;
          playing = false;
          break;
        }
        elapsed -= list[index]!.duration;
        index++;
      }
    },
  } as JourneyPlayback<PlaybackStep>;
}
