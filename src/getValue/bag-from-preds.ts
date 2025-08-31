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