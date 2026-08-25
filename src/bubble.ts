import type { Term } from "./refs";

/** Hover bubble on a word. Lives on document.body so CSS2D transforms do not kill selection. */
export function attachBubble(host: HTMLElement, spec: Term, label?: string): void {
  host.classList.add("term");
  if (spec.underline === false) host.classList.add("term-plain");
  host.tabIndex = 0;
  host.setAttribute("aria-haspopup", "true");

  const titleText = (label ?? host.textContent ?? "").trim();
  const side = spec.side ?? "bottom";
  const bubble = document.createElement("div");
  bubble.className = `bubble bubble-${side}`;
  bubble.setAttribute("role", "tooltip");
  if (spec.width) bubble.style.setProperty("--bubble-w", spec.width);

  const card = document.createElement("div");
  card.className = "bubble-card";
  const title = document.createElement("p");
  title.className = "bubble-title";
  title.textContent = titleText;
  const list = document.createElement("ul");
  for (const b of spec.bullets) {
    const li = document.createElement("li");
    if (b.href) {
      const a = document.createElement("a");
      a.href = b.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = b.text;
      li.append(a);
    } else {
      li.textContent = b.text;
    }
    list.append(li);
  }
  card.append(title, list);
  bubble.append(card);
  document.body.append(bubble);

  const place = () => {
    const r = host.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) {
      hide();
      return;
    }
    const gap = 8;
    if (side === "bottom") {
      bubble.style.left = `${r.left + r.width / 2}px`;
      bubble.style.top = `${r.bottom + gap}px`;
    } else if (side === "top") {
      bubble.style.left = `${r.left + r.width / 2}px`;
      bubble.style.top = `${r.top - gap}px`;
    } else if (side === "right") {
      bubble.style.left = `${r.right + gap}px`;
      bubble.style.top = `${r.top + r.height / 2}px`;
    } else {
      bubble.style.left = `${r.left - gap}px`;
      bubble.style.top = `${r.top + r.height / 2}px`;
    }
  };

  let hideTimer = 0;
  let follow = 0;
  const show = () => {
    window.clearTimeout(hideTimer);
    host.classList.add("is-open");
    bubble.classList.add("is-open");
    place();
    if (!follow) {
      const loop = () => {
        if (!bubble.classList.contains("is-open")) {
          follow = 0;
          return;
        }
        place();
        follow = requestAnimationFrame(loop);
      };
      follow = requestAnimationFrame(loop);
    }
  };
  const hide = () => {
    host.classList.remove("is-open");
    bubble.classList.remove("is-open");
  };
  const laterHide = () => {
    hideTimer = window.setTimeout(hide, 220);
  };

  host.addEventListener("mouseenter", show);
  host.addEventListener("mouseleave", laterHide);
  host.addEventListener("focus", show);
  host.addEventListener("blur", laterHide);
  bubble.addEventListener("mouseenter", show);
  bubble.addEventListener("mouseleave", laterHide);
  bubble.addEventListener("mousedown", (e) => e.stopPropagation());
}

/** Wrap the first case-insensitive match of `word` inside `el`. */
export function wrapTerm(el: HTMLElement, word: string, spec: Term): HTMLElement | null {
  const src = el.textContent ?? "";
  const i = src.toLowerCase().indexOf(word.toLowerCase());
  if (i < 0) return null;
  const before = src.slice(0, i);
  const match = src.slice(i, i + word.length);
  const after = src.slice(i + word.length);
  el.textContent = "";
  if (before) el.append(before);
  const span = document.createElement("span");
  span.textContent = match;
  attachBubble(span, spec, match);
  el.append(span);
  if (after) el.append(after);
  return span;
}
