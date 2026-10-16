import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
/** Visibility tags are opaque to graphics; navigation policy belongs to the caller. */
export function createSceneLabel(
  title: string,
  meta: string,
  color: string,
  views: string | readonly string[],
): CSS2DObject {
  const el = document.createElement("div");
  el.className = "tag";
  el.dataset.lod = (typeof views === "string" ? [views] : views).join(",");
  el.innerHTML = meta
    ? `<span class="tag-title">${title}</span><span class="tag-meta">${meta}</span>`
    : `<span class="tag-title">${title}</span>`;
  el.style.setProperty("--tag", color);
  return new CSS2DObject(el);
}
