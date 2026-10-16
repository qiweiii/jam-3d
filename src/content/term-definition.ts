export type TermBullet = {
  text: string;
  href?: string;
};

/** Explanation data shared by feature notes and their DOM presentation. */
export type TermDefinition = {
  bullets: TermBullet[];
  side?: "top" | "bottom" | "left" | "right";
  width?: string;
  /** Dotted underline. Default true. Jam title skips it. */
  underline?: boolean;
};
