export type TourStep = { duration: number };

export type TourSnapshot<T extends TourStep> = {
  index: number;
  elapsed: number;
  playing: boolean;
  scrubbed: boolean;
  step: T;
};

export type TourPlayback<T extends TourStep = TourStep> = {
  readonly loop: boolean;
  snapshot: () => TourSnapshot<T>;
  select: (next: number) => void;
  /** Seek within this step and pause, without crossing into an adjacent step. */
  seek: (elapsed: number) => void;
  play: (value: boolean) => void;
  restart: () => void;
  tick: (dt: number) => void;
};

/** Generic captioned-sequence clock. The caller owns the steps and entry policy. */
export function createTourPlayback<T extends TourStep>(
  steps: readonly T[],
  options: { loop?: boolean } = {},
): TourPlayback<T> {
  const list = steps;
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
  };
}
