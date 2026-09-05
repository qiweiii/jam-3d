import { JOURNEY_STEPS } from "../content/journey";
import type { JourneyPlayback } from "../experience/playback";

export function createJourneyControls(host: HTMLElement, playback: JourneyPlayback) {
  const root = document.createElement("section");
  root.className = "journey-controls";
  root.setAttribute("aria-label", "Work package journey");
  root.innerHTML = `<p class="journey-caption">One package · successful path</p>
    <p class="journey-title"></p><p class="journey-body"></p>
    <div class="journey-actions"><button type="button" data-action="back">Back</button><button type="button" data-action="play">Play</button><button type="button" data-action="next">Next</button><button type="button" data-action="replay">Replay</button></div>`;
  host.append(root);
  const back = root.querySelector<HTMLButtonElement>('[data-action="back"]')!;
  const play = root.querySelector<HTMLButtonElement>('[data-action="play"]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-action="next"]')!;
  let last = "";
  const render = () => {
    const { index, playing, step } = playback.snapshot();
    const key = `${index}:${playing}`;
    if (key === last) return;
    last = key;
    root.querySelector(".journey-title")!.textContent = `${index + 1} / ${JOURNEY_STEPS.length} · ${step.title}`;
    root.querySelector(".journey-body")!.textContent = step.body;
    play.textContent = playing ? "Pause" : "Play";
    back.disabled = index === 0;
    next.disabled = index === JOURNEY_STEPS.length - 1;
  };
  for (const [button, delta] of [
    [back, -1],
    [next, 1],
  ] as const) {
    button.addEventListener("click", () => {
      playback.select(playback.snapshot().index + delta);
      playback.play(true);
      render();
    });
  }
  play.addEventListener("click", () => {
    const { index, elapsed, step, playing } = playback.snapshot();
    if (index === JOURNEY_STEPS.length - 1 && elapsed === step.duration) playback.restart();
    playback.play(!playing);
    render();
  });
  root.querySelector('[data-action="replay"]')!.addEventListener("click", () => {
    playback.restart();
    playback.play(true);
    render();
  });
  render();
  return {
    render,
    setVisible: (visible: boolean) => {
      root.hidden = !visible;
    },
    dispose: () => root.remove(),
  };
}
