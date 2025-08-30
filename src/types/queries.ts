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
 * Main query type that combines all query capabilities into a comprehensive query structure. Supports logical operators, direct field queries, and deep nested field queries with dot notation. This is the primary type used for constructing type-safe queries.
 *
 *@template T — The type of objects being queried
 *
 *@example
 *```typescript
 *interface User {
 *  name: string;
 *  age: number;
 *  profile: {
 *    active: boolean;
 *    settings: {
 *      theme: string;
 *    };
 *  };
 *  tags: string[];
 *}
 *
 * Simple field query
 *const simpleQuery: SafeSiftQuery<User> = {
 *  name: "John",
 *  age: { $gt: 18 }
 *};
 *
 * Nested field query with dot notation
 *const nestedQuery: SafeSiftQuery<User> = {
 *  "profile.active": true,
 *  "profile.settings.theme": "dark"
 *};
 *
 * Complex query with logical operators
 *const complexQuery: SafeSiftQuery<User> = {
 *  $and: [
 *    { age: { $gte: 18 } },
 *    { "profile.active": true }
 *  ],
 *  $or: [
 *    { name: "John" },
 *    { tags: "admin" }
 *  ]
 *};
 *
 * Negated query
 *const negatedQuery: SafeSiftQuery<User> = {
 *  $not: {
 *    "profile.active": false
 *  }
 *};
 *```
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

/**
 * Utility type that extracts the value type at a given path within an object.
 *
 * @template T - The object type to extract the value from
 * @template K - The path string to the desired value
 *
 * @example
 * ```typescript
 * interface User {
 *   profile: {
 *     name: string;
 *     age: number;
 *   }
 * }
 *
 * type NameType = PathValue<User, 'profile.name'>; // string
 * type AgeType = PathValue<User, 'profile.age'>; // number
 * ```
 */
export type PathValue<T, K extends string> = K extends DeepKeyOf<T>
  ? DeepValueOf<T, K>
  : never;
