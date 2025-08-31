import type { Predicate } from "./predicate";
import type { Disjunction } from "./disjunction";

/**
 * Normalized representation of a query.
 *
 * @example
 * ```ts
 * const n: Normalized = {
 *   and: [{ path: "name", op: "$eq", value: "Alice" }],
 *   or: []
 * };
 * ```
 */
export type Normalized = { and: Predicate[]; or: Disjunction[] };