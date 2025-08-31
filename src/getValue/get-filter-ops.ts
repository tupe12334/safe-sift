import type { DeepKeyOf, GetOptions, OpsBag, SafeSiftQuery } from "@types";
import { normalizeQuery } from "./normalize-query";
import { bagFromPreds } from "./bag-from-preds";
import { mergeOpsBags } from "./merge-ops-bags";

/**
 * Get operator bag(s) for a field.
 *
 * @example
 * ```ts
 * getFilterOps({ age: { $gte: 18, $lte: 30 } }, "age");
 * // => { $gte: 18, $lte: 30 }
 *
 * getFilterOps({ $or: [{ age: { $gte: 18 } }, { age: { $gte: 21 } }] }, "age");
 * // => { $gte: 18 }  // default orMode="first"
 * ```
 */
type FilterOpsResult<T, K extends DeepKeyOf<T>> = OpsBag | OpsBag[] | undefined;

export function getFilterOps<T, K extends DeepKeyOf<T>>(
  query: SafeSiftQuery<T>,
  fieldPath: K,
  options: GetOptions = {}
): FilterOpsResult<T, K> {
  const { and, or } = normalizeQuery(query);
  const andBag = bagFromPreds(and.filter((p) => p.path === fieldPath));

  if (!or.length) {
    return Object.keys(andBag).length ? andBag : undefined;
  }

  const branchBags = or
    .map((branch) => bagFromPreds(branch.filter((p) => p.path === fieldPath)))
    .filter((bag) => Object.keys(bag).length);

  if (!branchBags.length) {
    return Object.keys(andBag).length ? andBag : undefined;
  }

  const mode = options.orMode || "first";

  if (mode === "first") {
    const firstBag = branchBags[0];

    if (firstBag === undefined) {
      // nothing in OR branches → fall back to AND-only if present
      return Object.keys(andBag).length ? andBag : undefined;
    }

    return mergeOpsBags(andBag, firstBag);
  }
  return branchBags.map((b) => mergeOpsBags(andBag, b));
}