import { HOME_VIEW, VIEW_IDS, type ViewId } from "./view-catalog.ts";
export type Route = {
  view: ViewId;
  /** 1-based step index for staged views; null when absent. */
  step: number | null;
};

const KNOWN: readonly string[] = VIEW_IDS;

/** `#/why?step=3` → { view: "why", step: 3 }; unknown paths fall back to the home view. */
export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#\/?/, "");
  const [viewPart, queryPart] = raw.split("?");
  const candidate = viewPart || HOME_VIEW;
  const view = (KNOWN.includes(candidate) ? candidate : HOME_VIEW) as ViewId;
  let step: number | null = null;
  if (queryPart) {
    const match = /(?:^|&)step=(\d+)/.exec(queryPart);
    if (match) step = Math.max(1, Number.parseInt(match[1]!, 10));
  }
  return { view, step };
}

export function routeHash(view: ViewId, step: number | null = null): string {
  return `#/${view}${step ? `?step=${step}` : ""}`;
}
