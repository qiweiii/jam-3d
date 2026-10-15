import { LODS, type LodId } from "../experience/views";
import { TERMS } from "../content/references";
import { attachBubble } from "./bubble";
import { createSources } from "./sources";

export function createNavigation(host: HTMLElement, onSelect: (id: LodId) => void) {
  const mast = document.createElement("div");
  mast.className = "mast";
  mast.innerHTML = `<p class="mast-jam" lang="en"><span><span>J</span>am</span></p>`;
  attachBubble(mast.querySelector("p > span")!, TERMS.jam, "Jam");
  const sources = createSources(host);
  const bar = document.createElement("nav");
  bar.className = "lod";
  bar.setAttribute("aria-label", "scale");
  const buttons = new Map<LodId, HTMLButtonElement>();
  const why = document.createElement("button");
  why.type = "button";
  why.textContent = "why";
  why.dataset.lod = "why";
  why.title = "Why JAM exists";
  why.addEventListener("click", () => onSelect("why"));
  buttons.set("why", why);
  bar.append(why);
  for (const id of LODS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = id;
    button.dataset.lod = id;
    button.addEventListener("click", () => onSelect(id));
    buttons.set(id, button);
    bar.append(button);
  }
  host.append(mast, bar);
  return {
    update(id: LodId) {
      mast.classList.toggle("is-hidden", id !== "machine");
      mast.inert = id !== "machine";
      for (const [key, button] of buttons) button.setAttribute("aria-current", key === id ? "true" : "false");
    },
    dispose() {
      mast.remove();
      bar.remove();
      sources.dispose();
    },
  };
}
