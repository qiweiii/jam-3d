import type { JourneyPlayback } from "../experience/playback";

export type CaptionStep = {
  title: string;
  body: string;
  duration: number;
};

type ControlsOptions = {
  caption: string;
  label: string;
  /** When set, the last step's Next becomes this exit button. */
  finish?: { text: string; onSelect: () => void };
  /** Manual tours (why) hide Play/Pause; Next and Back remain. Default true. */
  showPlay?: boolean;
  /** Manual tours show Replay only on the final step. */
  replayAtEnd?: boolean;
};

/** Caption panel driving a stop playback; shared by the journey and the why tour. */
export function createJourneyControls(
  host: HTMLElement,
  playback: JourneyPlayback,
  steps: readonly CaptionStep[],
  options: ControlsOptions,
) {
  const root = document.createElement("section");
  root.className = "journey-controls";
  root.setAttribute("aria-label", options.label);
  root.innerHTML = `<p class="journey-caption">${options.caption}</p>
    <p class="journey-title"></p><p class="journey-body"></p>
    <div class="journey-actions"><button type="button" data-action="back">Back</button><button type="button" data-action="play">Play</button><button type="button" data-action="next">Next</button><button type="button" data-action="replay">Replay</button></div>`;
  host.append(root);
  const back = root.querySelector<HTMLButtonElement>('[data-action="back"]')!;
  const play = root.querySelector<HTMLButtonElement>('[data-action="play"]')!;
  const showPlay = options.showPlay ?? true;
  if (!showPlay) play.remove();
  const next = root.querySelector<HTMLButtonElement>('[data-action="next"]')!;
  const replay = root.querySelector<HTMLButtonElement>('[data-action="replay"]')!;
  let last = "";
  const render = () => {
    const { index, playing } = playback.snapshot();
    const key = `${index}:${playing}`;
    if (key === last) return;
    last = key;
    const caption = steps[index]!;
    const atFinish = index === steps.length - 1 && Boolean(options.finish);
    root.querySelector(".journey-title")!.textContent = `${index + 1} / ${steps.length} · ${caption.title}`;
    root.querySelector(".journey-body")!.textContent = caption.body;
    if (showPlay) play.textContent = playing ? "Pause" : "Play";
    replay.hidden = Boolean(options.replayAtEnd) && index !== steps.length - 1;
    back.disabled = index === 0;
    next.textContent = atFinish ? options.finish!.text : "Next";
    next.disabled = index === steps.length - 1 && !atFinish;
  };
  for (const [button, delta] of [
    [back, -1],
    [next, 1],
  ] as const) {
    button.addEventListener("click", () => {
      const { index } = playback.snapshot();
      if (delta > 0 && index === steps.length - 1 && options.finish) {
        options.finish.onSelect();
        return;
      }
      playback.select(index + delta);
      if (showPlay) playback.play(true);
      render();
    });
  }
  if (showPlay) {
    play.addEventListener("click", () => {
      const { index, elapsed, step, playing } = playback.snapshot();
      if (index === steps.length - 1 && elapsed === step.duration) playback.restart();
      playback.play(!playing);
      render();
    });
  }
  root.querySelector('[data-action="replay"]')!.addEventListener("click", () => {
    playback.restart();
    if (showPlay) playback.play(true);
    render();
  });
  render();
  root.hidden = true;
  return {
    render,
    setVisible: (visible: boolean) => {
      root.hidden = !visible;
    },
    dispose: () => root.remove(),
  };
}
