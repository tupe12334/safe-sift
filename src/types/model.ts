/**
 * Core MQL/operator and normalization model types.
 * Split into a separate module to avoid conflicts with your other `types.ts`.
 */

/**
 * All supported Mongo-style operators this utility recognizes.
 *
 * @example
 * ```ts
 * type Op = MqlOperator; // "$eq" | "$gte" | "$lte" ...
 * ```
 */
export type MqlOperator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$in"
  | "$nin"
  | "$exists"
  | "$regex"
  | "$size"
  | "$all"
  | "$elemMatch"
  | "$type"
  | "$not"
  | "$bitsAllSet"
  | "$bitsAnySet"
  | "$bitsAllClear"
  | "$bitsAnyClear";

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

/**
 * A compact bag of operators for a specific field path.
 *
 * @example
 * ```ts
 * const bag: OpsBag = { $gte: 18, $lte: 30 };
 * ```
 */
export type OpsBag = Partial<Record<MqlOperator, unknown>>;

/**
 * Strategy for handling `$or` branches.
 *
 * @example
 * ```ts
 * const mode: OrMode = "all";
 * ```
 */
export type OrMode = "first" | "all";

/**
 * Options for getters.
 *
 * @example
 * ```ts
 * const opts: GetOptions = { orMode: "all" };
 * ```
 */
export type GetOptions = {
  orMode?: OrMode;
};
