import { ZOOM_VIEWS, type ViewId } from "../app/view-catalog";
import { attachBubble } from "./term-bubble";
import { createSourcesDialog } from "./sources-dialog";

export function createNavigation(host: HTMLElement, onSelect: (id: ViewId) => void) {
  const mast = document.createElement("div");
  mast.className = "mast";
  mast.innerHTML = `<p class="mast-jam" lang="en"><span><span>J</span>am</span></p>`;
  attachBubble(
    mast.querySelector("p > span")!,
    {
      side: "bottom",
      width: "22rem",
      underline: false,
      bullets: [
        { text: "Join-Accumulate Machine: a mostly-coherent trustless supercomputer." },
        { text: "Gray Paper · JOIN-ACCUMULATE MACHINE", href: "https://graypaper.com/" },
      ],
    },
    "Jam",
  );
  const sources = createSourcesDialog(host);
  const bar = document.createElement("nav");
  bar.className = "lod";
  bar.setAttribute("aria-label", "scale");
  const buttons = new Map<ViewId, HTMLButtonElement>();
  const why = document.createElement("button");
  why.type = "button";
  why.textContent = "why";
  why.dataset.lod = "why";
  why.title = "Why JAM exists";
  why.addEventListener("click", () => onSelect("why"));
  buttons.set("why", why);
  bar.append(why);
  for (const id of ZOOM_VIEWS) {
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
    update(id: ViewId) {
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
