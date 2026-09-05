/** Scene gestures belong to the app; browser zoom and reading panels keep native behavior. */
export function attachSceneInput(
  canvas: HTMLCanvasElement,
  dolly: (amount: number) => void,
  step: (delta: number) => void,
) {
  const events = new AbortController();
  let lastGestureScale = 1;
  canvas.tabIndex = 0;
  canvas.setAttribute("aria-label", "JAM 3D scene. Arrow keys change scale; plus and minus zoom.");
  canvas.addEventListener(
    "wheel",
    (event) => {
      if (event.deltaY === 0 || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      dolly(wheelDollyAmount(event.deltaY, event.deltaMode, canvas.clientHeight, false));
    },
    { passive: false, signal: events.signal },
  );

  // On macOS, trackpad pinch is reported as a ctrl-modified wheel event. This
  // must live on window capture because bubbles and panels are outside canvas.
  window.addEventListener(
    "wheel",
    (event) => {
      if (event.deltaY === 0 || (!event.ctrlKey && !event.metaKey)) return;
      event.preventDefault();
      dolly(wheelDollyAmount(event.deltaY, event.deltaMode, canvas.clientHeight, true));
    },
    { capture: true, passive: false, signal: events.signal },
  );
  window.addEventListener(
    "gesturestart",
    (event) => {
      event.preventDefault();
      lastGestureScale = readGestureScale(event);
    },
    { capture: true, passive: false, signal: events.signal },
  );
  window.addEventListener(
    "gesturechange",
    (event) => {
      event.preventDefault();
      const scale = readGestureScale(event);
      dolly((scale - lastGestureScale) * 8);
      lastGestureScale = scale;
    },
    { capture: true, passive: false, signal: events.signal },
  );
  window.addEventListener(
    "gestureend",
    (event) => {
      event.preventDefault();
      lastGestureScale = 1;
    },
    { capture: true, passive: false, signal: events.signal },
  );
  canvas.addEventListener(
    "keydown",
    (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "+" || event.key === "=") dolly(0.25);
      else if (event.key === "-") dolly(-0.25);
      else if (event.key === "ArrowRight" || event.key === "ArrowDown") step(1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") step(-1);
      else return;
      event.preventDefault();
    },
    { signal: events.signal },
  );
  return () => events.abort();
}

export function wheelDollyAmount(deltaY: number, deltaMode: number, viewportHeight: number, pinch: boolean): number {
  if (deltaY === 0) return 0;
  const unit = deltaMode === 1 ? 16 : deltaMode === 2 ? viewportHeight : 1;
  return deltaY * unit * 0.0026 * (pinch ? -1 : 1);
}

function readGestureScale(event: Event): number {
  const scale = (event as Event & { scale?: unknown }).scale;
  return typeof scale === "number" && Number.isFinite(scale) ? scale : 1;
}
