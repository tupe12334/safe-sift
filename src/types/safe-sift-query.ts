import type { DeepKeyOf } from "./deep-key-of";
import type { DeepValueOf } from "./deep-value-of";
import type { ComparisonOperators } from "./comparison-operators";

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
export type SafeSiftQuery<T> = {
  $and?: SafeSiftQuery<T>[];
  $or?: SafeSiftQuery<T>[];
  $nor?: SafeSiftQuery<T>[];
  $not?: SafeSiftQuery<T>;
} & {
  [K in keyof T]?: FieldQuery<T[K]>;
} & {
  [K in DeepKeyOf<T>]?: FieldQuery<DeepValueOf<T, K>>;
};

/**
 * Union of all supported field query shapes.
 */
type FieldQuery<T> =
  | ComparisonOperators<T>
  | ArrayOperators<T>
  | T
  | (T extends ReadonlyArray<infer U> ? U : never);

/**
 * Operators for array fields.
 */
type ArrayOperators<T> = T extends ReadonlyArray<infer U>
  ? {
      $all?: U[];
      $elemMatch?: SafeSiftQuery<U>;
    }
  : never;