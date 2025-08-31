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
  $in?: T extends ReadonlyArray<infer U> ? U[] : T[];
  $nin?: T extends ReadonlyArray<infer U> ? U[] : T[];
  $regex?: T extends string ? RegExp | string : never;
  $options?: T extends string ? string : never;
  $exists?: boolean;
  $type?: string;
  $size?: T extends ReadonlyArray<unknown> ? number : never;
};