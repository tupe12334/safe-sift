/**
 * Helper type for $in and $nin operators that properly handles union types
 * Uses tuple wrapping to prevent distributive conditional types
 */
type InOperatorArray<T> = [T] extends [ReadonlyArray<infer U>] ? U[] : T[];

/**
 * Type representing MongoDB-style comparison operators for field queries.
 */
export type ComparisonOperators<T> = {
  $eq?: T;
  $ne?: T;
  $gt?: T extends string | number | Date ? T : never;
  $gte?: T extends string | number | Date ? T : never;
  $lt?: T extends string | number | Date ? T : never;
  $lte?: T extends string | number | Date ? T : never;
  $in?: InOperatorArray<T>;
  $nin?: InOperatorArray<T>;
  $regex?: T extends string ? RegExp | string : never;
  $options?: T extends string ? string : never;
  $exists?: boolean;
  $type?: string;
  $size?: T extends ReadonlyArray<unknown> ? number : never;
};
