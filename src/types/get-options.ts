import type { OrMode } from "./or-mode";

/**
 * Options for getters.
 *
 * @example
 * ```ts
 * const opts: GetOptions = { orMode: "all" };
 * ```
 */
export type GetOptions = {
  orMode?: OrMode;
};