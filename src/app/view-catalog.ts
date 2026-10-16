/** Navigation policy, independent of camera geometry and rendering infrastructure. */
export const ZOOM_VIEWS = ["machine", "core", "package", "block", "stf"] as const;

/** The zoom chain plus independently entered rationale and service scenes. */
export type ViewId = (typeof ZOOM_VIEWS)[number] | "why" | "parachain";

export const VIEW_IDS: readonly ViewId[] = [...ZOOM_VIEWS, "why", "parachain"];

export const HOME_VIEW: ViewId = "machine";

export function viewIndex(id: ViewId): number {
  return ZOOM_VIEWS.indexOf(id as (typeof ZOOM_VIEWS)[number]);
}

/** Only the nested zoom chain crosses stages; independent tours stay in their own scene. */
export function stepView(id: ViewId, delta: number): ViewId {
  const index = viewIndex(id);
  if (index < 0) return id;
  return ZOOM_VIEWS[Math.max(0, Math.min(ZOOM_VIEWS.length - 1, index + delta))] ?? id;
}
