import type { MqlOperator } from "./mql-operator";

/**
 * Atomic predicate produced by normalization.
 *
 * @example
 * ```ts
 * const p: Predicate = { path: "age", op: "$gte", value: 18 };
 * ```
 */
export type Predicate = {
  path: string;
  op: MqlOperator;
  value: unknown;
};