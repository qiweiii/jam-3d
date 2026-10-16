import type { TourPlayback } from "../playback/tour-playback";

export type CaptionStep = {
  title: string;
  body: string;
  duration: number;
};

type ControlsOptions = {
  caption?: string;
  label: string;
  /** When set, the last step's Next becomes this exit button. */
  finish?: { text: string; onSelect: () => void };
  /** Manual tours (why) hide Play/Pause; Next and Back remain. Default true. */
  showPlay?: boolean;
  /** Manual tours show Replay only on the final step. */
  replayAtEnd?: boolean;
  /** Hide Next on the final step when the scene has its own exit link. */
  hideNextAtEnd?: boolean;
  /** Per-step seek bar for animated tours. */
  showProgress?: boolean;
};

/** Caption panel shared by the package, Why JAM and Parachain Service tours. */
export function createTourControls(
  host: HTMLElement,
  playback: TourPlayback,
  steps: readonly CaptionStep[],
  options: ControlsOptions,
) {
  const root = document.createElement("section");
  root.className = "journey-controls";
  root.setAttribute("aria-label", options.label);
  const heading = options.caption ? `<p class="journey-caption">${options.caption}</p>` : "";
  root.innerHTML = `${heading}
    <p class="journey-title"></p><p class="journey-body"></p>
    <input class="journey-progress" type="range" min="0" max="1000" step="1" value="0" aria-label="Step progress" title="Click or drag to pause and scrub this step">
    <div class="journey-actions"><button type="button" data-action="back">Back</button><button type="button" data-action="play">Play</button><button type="button" data-action="next">Next</button><button type="button" data-action="replay">Replay</button></div>`;
  host.append(root);
  const back = root.querySelector<HTMLButtonElement>('[data-action="back"]')!;
  const play = root.querySelector<HTMLButtonElement>('[data-action="play"]')!;
  const showPlay = options.showPlay ?? true;
  if (!showPlay) play.remove();
  const progress = root.querySelector<HTMLInputElement>(".journey-progress")!;
  if (!options.showProgress) progress.remove();
  const next = root.querySelector<HTMLButtonElement>('[data-action="next"]')!;
  const replay = root.querySelector<HTMLButtonElement>('[data-action="replay"]')!;
  if (playback.loop) replay.remove();
  let last = "";
  const render = () => {
    const { index, playing, elapsed, step } = playback.snapshot();
    if (options.showProgress) {
      const fraction = Math.max(0, Math.min(1, elapsed / step.duration));
      progress.value = String(Math.round(fraction * 1000));
      progress.style.setProperty("--progress", `${fraction * 100}%`);
      progress.setAttribute("aria-valuetext", `${Math.round(fraction * 100)}% of step ${index + 1}`);
    }
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
    next.hidden = Boolean(options.hideNextAtEnd) && index === steps.length - 1;
    next.disabled = index === steps.length - 1 && !atFinish && !playback.loop;
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
      playback.select(delta > 0 && index === steps.length - 1 && playback.loop ? 0 : index + delta);
      if (showPlay) playback.play(true);
      render();
    });
  }
  const togglePlay = () => {
    const { index, elapsed, step, playing } = playback.snapshot();
    if (index === steps.length - 1 && elapsed === step.duration) playback.restart();
    playback.play(!playing);
    render();
  };
  if (showPlay) play.addEventListener("click", togglePlay);
  if (options.showProgress) {
    progress.addEventListener("pointerdown", () => {
      playback.play(false);
      render();
    });
    progress.addEventListener("input", () => {
      playback.seek((progress.valueAsNumber / 1000) * playback.snapshot().step.duration);
      render();
    });
  }
  replay.addEventListener("click", () => {
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
