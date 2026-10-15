import { JOURNEY_STEPS } from "../content/journey.ts";

export type PlaybackStep = { duration: number };

export type PlaybackSnapshot<T extends PlaybackStep> = {
  index: number;
  elapsed: number;
  playing: boolean;
  scrubbed: boolean;
  step: T;
};

export type JourneyPlayback<T extends PlaybackStep = PlaybackStep> = {
  readonly loop: boolean;
  snapshot: () => PlaybackSnapshot<T>;
  select: (next: number) => void;
  /** Seek within this step and pause, without crossing into an adjacent step. */
  seek: (elapsed: number) => void;
  play: (value: boolean) => void;
  restart: () => void;
  tick: (dt: number) => void;
};

export type JourneyStep = (typeof JOURNEY_STEPS)[number];

/** Clockwork for a captioned stop sequence; defaults to the package journey. */
export function createJourneyPlayback(): JourneyPlayback<JourneyStep>;
export function createJourneyPlayback<T extends PlaybackStep>(
  steps: readonly T[],
  options?: { loop?: boolean },
): JourneyPlayback<T>;
export function createJourneyPlayback(
  steps?: readonly PlaybackStep[],
  options: { loop?: boolean } = {},
): JourneyPlayback<PlaybackStep> {
  const list: readonly PlaybackStep[] = steps ?? JOURNEY_STEPS;
  const loop = options.loop ?? false;
  let index = 0;
  let elapsed = 0;
  let playing = false;
  let scrubbed = false;
  const snapshot = () => ({ index, elapsed, playing, scrubbed, step: list[index]! });
  const select = (next: number) => {
    index = Math.max(0, Math.min(list.length - 1, next));
    elapsed = 0;
    scrubbed = false;
  };
  return {
    loop,
    snapshot,
    select,
    seek(time: number) {
      if (!Number.isFinite(time)) return;
      elapsed = Math.max(0, Math.min(list[index]!.duration, time));
      playing = false;
      scrubbed = true;
    },
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
        if (index === list.length - 1 && !loop) {
          elapsed = list[index]!.duration;
          playing = false;
          break;
        }
        elapsed -= list[index]!.duration;
        index = (index + 1) % list.length;
        scrubbed = false;
      }
    },
  } as JourneyPlayback<PlaybackStep>;
}
