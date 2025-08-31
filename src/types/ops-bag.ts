import type { MqlOperator } from "./mql-operator";

/**
 * A compact bag of operators for a specific field path.
 *
 * @example
 * ```ts
 * const bag: OpsBag = { $gte: 18, $lte: 30 };
 * ```
 */
export type OpsBag = Partial<Record<MqlOperator, unknown>>;