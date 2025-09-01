import type { DeepKeyOf, GetOptions, OpsBag, SafeSiftQuery } from "../types";
import { getFilterOps } from "./get-filter-ops";

type FilterValueResult = unknown | OpsBag | OpsBag[] | undefined;

/**
 * Get a single operator value or bag for a field from a query.
 *
 * This function extracts values from SafeSift queries, returning either:
 * - The specific operator value when `op` is provided
 * - The equality value when no operator is specified and $eq exists
 * - The full operator bag when no specific value can be extracted
 * - undefined when the field is not present in the query
 *
 * @template T - The type of objects being queried
 * @template K - The field path within the object type
 * @param query - The SafeSift query object
 * @param fieldPath - The field path to extract the value for (supports dot notation)
 * @param op - Optional specific operator to extract (e.g., "$gte", "$eq")
 * @param options - Optional configuration for query processing
 * @returns The extracted value, operator bag, or undefined
 *
 * @example
 * ```typescript
 * // Extract equality value
 * getFilterValue({ name: "Alice" }, "name");
 * // => "Alice"
 *
 * // Extract specific operator value
 * getFilterValue({ age: { $gte: 18, $lte: 30 } }, "age", "$gte");
 * // => 18
 *
 * // Get full operator bag when no $eq exists
 * getFilterValue({ age: { $gte: 18, $lte: 30 } }, "age");
 * // => { $gte: 18, $lte: 30 }
 *
 * // Returns undefined for non-existent fields
 * getFilterValue({ age: { $gte: 18, $lte: 30 } }, "name");
 * // => undefined
 *
 * // Works with nested paths
 * getFilterValue({ "profile.age": { $gt: 21 } }, "profile.age", "$gt");
 * // => 21
 * ```
 */
export function getFilterValue<T, K extends DeepKeyOf<T>>(
  query: SafeSiftQuery<T>,
  fieldPath: K,
  op?: keyof OpsBag,
  options?: GetOptions
): FilterValueResult {
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
