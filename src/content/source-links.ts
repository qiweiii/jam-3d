/** Gray Paper reader + secondary notes. Default draft is 0.8.0. */
export const GP_DRAFT = "0.8.0";
/** First 7 chars of the 0.8.0 paper hash on Fluffy Labs. */
export const GP_VER = "07f041d";
export const GP_READER = "https://graypaper.fluffylabs.dev";
export const KIAN_JAM = "https://blog.kianenigma.com/posts/tech/demystifying-jam/";

/** Use reader selections copied from a highlight; do not invent page indexes. */
export function gp(selection = "", draft = GP_DRAFT): string {
  const sel = selection.replace(/[#/]/g, "");
  const q = `v=${draft}`;
  return sel ? `${GP_READER}/#/${GP_VER}/${sel}?${q}` : `${GP_READER}/#/${GP_VER}?${q}`;
}

export function kian(headingId: string): string {
  const id = headingId.replace(/^#/, "");
  return `${KIAN_JAM}#${id}`;
}
