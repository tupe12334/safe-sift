import type { DeepKeyOf, DeepValueOf } from "./deep";

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

/**
 * Forward declaration to allow recursive references across types.
 */
export type SafeSiftQuery<T> = LogicalOperators<T> & {
  [K in keyof T]?: FieldQuery<T[K]>;
} & {
  [K in DeepKeyOf<T>]?: FieldQuery<DeepValueOf<T, K>>;
};

/**
 * Type representing MongoDB-style logical operators.
 */
export type LogicalOperators<T> = {
  $and?: SafeSiftQuery<T>[];
  $or?: SafeSiftQuery<T>[];
  $nor?: SafeSiftQuery<T>[];
  $not?: SafeSiftQuery<T>;
};

/**
 * Operators for array fields.
 */
export type ArrayOperators<T> = T extends ReadonlyArray<infer U>
  ? {
      $all?: U[];
      $elemMatch?: SafeSiftQuery<U>;
    }
  : never;

/**
 * Union of all supported field query shapes.
 */
export type FieldQuery<T> =
  | ComparisonOperators<T>
  | ArrayOperators<T>
  | T
  | (T extends ReadonlyArray<infer U> ? U : never);
