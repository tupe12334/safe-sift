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