import type { DeepKeyOf, GetOptions, OpsBag, SafeSiftQuery } from "../types";
import { getFilterOps } from "./get-filter-ops";

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

type FilterValueResult<T> = unknown | OpsBag | OpsBag[] | undefined;

export function getFilterValue<T, K extends DeepKeyOf<T>>(
  query: SafeSiftQuery<T>,
  fieldPath: K,
  op?: keyof OpsBag,
  options?: GetOptions
): FilterValueResult<T> {
  const ops = getFilterOps<T, K>(query, fieldPath, options);
  if (!ops) return undefined;

  // If a specific operator is requested, return that value typed to the field
  if (op) {
    if (Array.isArray(ops)) {
      const firstOps = ops[0];
      const v = firstOps ? firstOps[op] : undefined;
      return v;
    }
    return ops[op];
  }

  // op omitted → prefer $eq, else return the bag(s)
  if (Array.isArray(ops)) {
    const first = ops[0];
    if (first && first["$eq"] !== undefined) {
      return first["$eq"];
    }
    return ops; // OpsBag[]
  }

  if (ops["$eq"] !== undefined) {
    return ops["$eq"];
  }

  return ops; // OpsBag
}