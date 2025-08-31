import type { OpsBag, Predicate } from "@types";

/**
 * Build an operator bag from predicates.
 *
 * @example
 * ```ts
 * bagFromPreds([
 *   { path: "age", op: "$gte", value: 18 },
 *   { path: "age", op: "$lte", value: 30 }
 * ]);
 * // => { $gte: 18, $lte: 30 }
 * ```
 */
export function bagFromPreds(preds: Predicate[]): OpsBag {
  const bag: OpsBag = {};
  for (const p of preds) bag[p.op] = p.value;
  return bag;
}

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
  return bags.reduce((acc, b) => Object.assign(acc, b), {} as OpsBag);
}
