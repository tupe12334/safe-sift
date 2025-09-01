import type { OpsBag } from "../types";

/**
 * Merge multiple operator bags.
 *
 * @example
 * ```ts
 * mergeOpsBags({ $gte: 18 }, { $lte: 30 });
 * // => { $gte: 18, $lte: 30 }
 * ```
 */
export function mergeOpsBags(...bags: OpsBag[]): OpsBag {
  return bags.reduce((acc, b) => Object.assign(acc, b), {});
}