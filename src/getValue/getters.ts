import type {
  DeepKeyOf,
  GetOptions,
  OpsBag,
  PathValue,
  SafeSiftQuery,
} from "@types";
import { normalizeQuery } from "./filter-normalize";
import { bagFromPreds, mergeOpsBags } from "./filter-ops";

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
export function getFilterOps<T, K extends DeepKeyOf<T>>(
  query: SafeSiftQuery<T>,
  fieldPath: K,
  options: GetOptions = {}
): OpsBag | OpsBag[] | undefined {
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

/**
 * Get a single operator value or bag for a field.
 *
 * @example
 * ```ts
 * getFilterValue({ name: "Alice" }"name");
 * // => "Alice"
 *
 * getFilterValue({ age: { $gte: 18, $lte: 30 } }, "age",  "$gte");
 * // => 18
 *
 * * getFilterValue({ age: { $gte: 18, $lte: 30 } }, "age");
 * // => { $gte: 18, $lte: 30 }
 *
 * * getFilterValue({ age: { $gte: 18, $lte: 30 } }, "name");
 * // => undefined + TS error
 * ```
 */

export function getFilterValue<T, K extends DeepKeyOf<T>>(
  query: SafeSiftQuery<T>,
  fieldPath: K,
  op?: keyof OpsBag,
  options?: GetOptions
): PathValue<T, K> | OpsBag | OpsBag[] | undefined {
  const ops = getFilterOps<T, K>(query, fieldPath, options);
  if (!ops) return undefined;

  // If a specific operator is requested, return that value typed to the field
  if (op) {
    if (Array.isArray(ops)) {
      const v = ops[0]?.[op];
      return v as PathValue<T, K> | undefined; // <- eliminate 'unknown'
    }
    return (ops as OpsBag)[op] as PathValue<T, K> | undefined; // <- eliminate 'unknown'
  }

  // op omitted → prefer $eq, else return the bag(s)
  if (Array.isArray(ops)) {
    const first = ops[0];
    if (first && first["$eq"] !== undefined) {
      return first["$eq"] as PathValue<T, K>;
    }
    return ops; // OpsBag[]
  }

  if (ops["$eq"] !== undefined) {
    return ops["$eq"] as PathValue<T, K>;
  }

  return ops; // OpsBag
}
