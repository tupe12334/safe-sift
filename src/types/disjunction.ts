import type { Predicate } from "./predicate";

/**
 * One disjunctive branch (`$or` branch).
 *
 * @example
 * ```ts
 * const branch: Disjunction = [
 *   { path: "age", op: "$gte", value: 18 },
 *   { path: "age", op: "$lte", value: 30 }
 * ];
 * ```
 */
export type Disjunction = Predicate[];