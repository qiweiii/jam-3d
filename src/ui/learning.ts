import { LESSONS } from "../content/lessons";

export function createLearning(host: HTMLElement) {
  const root = document.createElement("aside");
  root.className = "learning";
  root.setAttribute("aria-label", "Learn JAM");
  root.innerHTML = `<button type="button" class="learning-toggle" aria-expanded="false" aria-controls="learning-content">Learn JAM <span aria-hidden="true">+</span></button>
    <div id="learning-content" hidden>
      <div class="learning-copy" aria-live="polite"><p class="lesson-count"></p><h2></h2><p class="lesson-body"></p></div>
      <div class="lesson-actions"><button type="button" data-action="back">Back</button><a target="_blank" rel="noopener noreferrer">Gray Paper ↗</a><button type="button" data-action="next">Next</button></div>
    </div>`;
  host.append(root);
  const toggle = root.querySelector<HTMLButtonElement>(".learning-toggle")!;
  const content = root.querySelector<HTMLElement>("#learning-content")!;
  const back = root.querySelector<HTMLButtonElement>('[data-action="back"]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-action="next"]')!;
  let index = 0;
  const render = () => {
    const lesson = LESSONS[index]!;
    root.querySelector(".lesson-count")!.textContent = `${index + 1} / ${LESSONS.length}`;
    root.querySelector("h2")!.textContent = lesson.title;
    root.querySelector(".lesson-body")!.textContent = lesson.body;
    root.querySelector("a")!.href = lesson.source;
    back.disabled = index === 0;
    next.textContent = index === LESSONS.length - 1 ? "Restart" : "Next";
  };
  const collapse = () => {
    content.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector("span")!.textContent = "+";
  };
  const onPointerDown = (event: PointerEvent) => {
    if (content.hidden) return;
    if (root.contains(event.target as Node)) return;
    collapse();
  };
  document.addEventListener("pointerdown", onPointerDown);
  toggle.addEventListener("click", () => {
    if (!content.hidden) return collapse();
    content.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector("span")!.textContent = "−";
  });
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    collapse();
    toggle.focus();
  });
  back.addEventListener("click", () => {
    index = Math.max(0, index - 1);
    render();
  });
  next.addEventListener("click", () => {
    index = (index + 1) % LESSONS.length;
    render();
  });
  render();
  return { dispose: () => {
    document.removeEventListener("pointerdown", onPointerDown);
    root.remove();
  } };
}
