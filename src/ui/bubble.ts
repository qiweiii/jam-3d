import type { Term } from "../content/references";

const bubbles = new Map<HTMLElement, { hide: () => void; dispose: () => void }>();
let nextId = 0;

/** Hover bubble on a word. Lives on document.body so CSS2D transforms do not kill selection. */
export function attachBubble(host: HTMLElement, spec: Term, label?: string): void {
  host.classList.add("term");
  if (spec.underline === false) host.classList.add("term-plain");
  host.tabIndex = 0;
  host.setAttribute("role", "button");
  host.setAttribute("aria-haspopup", "dialog");
  host.setAttribute("aria-expanded", "false");
  const events = new AbortController();

  const titleText = (label ?? host.textContent ?? "").trim();
  const side = spec.side ?? "bottom";
  const bubble = document.createElement("div");
  bubble.className = `bubble bubble-${side}`;
  bubble.id = `term-${nextId++}`;
  bubble.setAttribute("role", "dialog");
  bubble.setAttribute("aria-label", titleText);
  host.setAttribute("aria-controls", bubble.id);
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
    const w = bubble.offsetWidth;
    const h = bubble.offsetHeight;
    let x = r.left + (r.width - w) / 2;
    let y = r.bottom + gap;
    if (side === "bottom") {
      if (y + h > window.innerHeight - gap) y = r.top - h - gap;
    } else if (side === "top") {
      y = r.top - h - gap;
    } else if (side === "right") {
      x = r.right + gap;
      y = r.top + (r.height - h) / 2;
    } else {
      x = r.left - w - gap;
      y = r.top + (r.height - h) / 2;
    }
    bubble.style.left = `${Math.max(gap, Math.min(x, window.innerWidth - w - gap))}px`;
    bubble.style.top = `${Math.max(gap, Math.min(y, window.innerHeight - h - gap))}px`;
  };

  let hideTimer = 0;
  let follow = 0;
  const show = () => {
    const tag = host.closest(".tag");
    if (tag?.classList.contains("is-hidden")) return;
    for (const [element, entry] of bubbles) if (element !== host) entry.hide();
    window.clearTimeout(hideTimer);
    host.setAttribute("aria-expanded", "true");
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
    window.clearTimeout(hideTimer);
    cancelAnimationFrame(follow);
    follow = 0;
    host.setAttribute("aria-expanded", "false");
    host.classList.remove("is-open");
    bubble.classList.remove("is-open");
  };
  const laterHide = () => {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (!bubble.contains(document.activeElement)) hide();
    }, 220);
  };

  const options = { signal: events.signal };
  host.addEventListener(
    "pointerenter",
    (event) => {
      if (event.pointerType === "mouse") show();
    },
    options,
  );
  host.addEventListener(
    "pointerleave",
    (event) => {
      if (event.pointerType === "mouse") laterHide();
    },
    options,
  );
  host.addEventListener(
    "focus",
    () => {
      if (host.matches(":focus-visible")) show();
    },
    options,
  );
  host.addEventListener("blur", laterHide, options);
  host.addEventListener("click", () => show(), options);
  host.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        show();
        bubble.querySelector("a")?.focus();
      }
    },
    options,
  );
  bubble.addEventListener("mouseenter", show, options);
  bubble.addEventListener("mouseleave", laterHide, options);
  bubble.addEventListener("focusout", laterHide, options);
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape" || !bubble.classList.contains("is-open")) return;
      if (bubble.contains(document.activeElement)) host.focus();
      hide();
    },
    options,
  );
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target instanceof Node && !host.contains(event.target) && !bubble.contains(event.target)) hide();
    },
    options,
  );
  bubbles.set(host, {
    hide,
    dispose: () => {
      hide();
      events.abort();
      bubble.remove();
      bubbles.delete(host);
    },
  });
}

export function hideOpenBubbles(): void {
  for (const entry of bubbles.values()) entry.hide();
}

export function disposeBubbles(root: HTMLElement): void {
  for (const [host, entry] of bubbles) if (root.contains(host)) entry.dispose();
}

/** Wrap the first case-insensitive match of `word` inside `el`. */
export function wrapTerm(el: HTMLElement, word: string, spec: Term, bubbleLabel?: string): HTMLElement | null {
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
  attachBubble(span, spec, bubbleLabel ?? match);
  el.append(span);
  if (after) el.append(after);
  return span;
}
