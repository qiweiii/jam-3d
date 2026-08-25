import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import type { LodId } from "../lod";

export function tag(title: string, meta: string, color: string, lod: LodId | LodId[]): CSS2DObject {
  const el = document.createElement("div");
  el.className = "tag";
  el.dataset.lod = (Array.isArray(lod) ? lod : [lod]).join(",");
  el.innerHTML = meta
    ? `<span class="tag-title">${title}</span><span class="tag-meta">${meta}</span>`
    : `<span class="tag-title">${title}</span>`;
  el.style.setProperty("--tag", color);
  return new CSS2DObject(el);
}
