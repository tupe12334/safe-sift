/**
 * Union type representing primitive values that cannot be further decomposed.
 * Used to determine when to stop recursion in deep type operations.
 * 
 * @example
 * ```typescript
 * // These are all primitive types:
 * const str: Primitive = "hello";
 * const num: Primitive = 42;
 * const bool: Primitive = true;
 * const date: Primitive = new Date();
 * const nullable: Primitive = null;
 * const undef: Primitive = undefined;
 * ```
 */
export type Primitive = string | number | boolean | Date | null | undefined;

/**
 * Recursively extracts all possible dot-notation path strings for accessing nested properties in an object.
 * Generates type-safe path strings that can be used for deep property access.
 * 
 * @template T - The object type to extract paths from
 * 
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   profile: {
 *     age: number;
 *     settings: {
 *       theme: string;
 *     };
 *   };
 *   tags: string[];
 * }
 * 
 * type UserPaths = DeepKeyOf<User>;
 * // Result: "name" | "profile" | "profile.age" | "profile.settings" | 
 * //         "profile.settings.theme" | "tags"
 * 
 * // Usage in function
 * function getValue<T, K extends DeepKeyOf<T>>(obj: T, path: K): DeepValueOf<T, K> {
 *   // Implementation would handle dot notation access
 * }
 * 
 * const user: User = { ... };
 * const theme = getValue(user, "profile.settings.theme"); // string
 * ```
 */
export type DeepKeyOf<T> = T extends Primitive
  ? never
  : T extends ReadonlyArray<infer U>
  ? DeepKeyOf<U>
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends Primitive
          ? `${K}`
          : T[K] extends ReadonlyArray<unknown>
          ? `${K}` | `${K}.${DeepKeyOf<T[K][number]>}`
          : `${K}` | `${K}.${DeepKeyOf<T[K]>}`
        : never;
    }[keyof T]
  : never;

/**
 * Extracts the type of a value at a given path within an object structure.
 * Works with dot-notation paths to access deeply nested properties.
 * 
 * @template T - The object type to extract the value from
 * @template K - The path string to the desired value
 * 
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   profile: {
 *     age: number;
 *     settings: {
 *       theme: string;
 *     };
 *   };
 * }
 * 
 * type NameType = DeepValueOf<User, "name">;                    // string
 * type AgeType = DeepValueOf<User, "profile.age">;            // number
 * type ThemeType = DeepValueOf<User, "profile.settings.theme">; // string
 * 
 * // Usage with generic functions
 * function getNestedValue<T, K extends DeepKeyOf<T>>(
 *   obj: T, 
 *   path: K
 * ): DeepValueOf<T, K> {
 *   // Implementation handles path resolution
 *   return path.split('.').reduce((o, p) => o[p], obj) as DeepValueOf<T, K>;
 * }
 * ```
 */
export type DeepValueOf<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends `${infer P}.${infer S}`
  ? P extends keyof T
    ? DeepValueOf<T[P], S>
    : never
  : never;

/**
 * Type representing MongoDB-style comparison operators for field queries.
 * Provides type-safe operators for comparing field values in queries.
 * 
 * @template T - The type of value being compared
 * 
 * @example
 * ```typescript
 * // Equality operators
 * const eqQuery: ComparisonOperators<string> = { $eq: "value" };
 * const neQuery: ComparisonOperators<number> = { $ne: 42 };
 * 
 * // Range operators (only for comparable types)
 * const rangeQuery: ComparisonOperators<number> = { 
 *   $gt: 10, 
 *   $lte: 100 
 * };
 * 
 * // Array operators
 * const arrayQuery: ComparisonOperators<string> = { 
 *   $in: ["admin", "user", "guest"] 
 * };
 * 
 * // String pattern matching
 * const regexQuery: ComparisonOperators<string> = { 
 *   $regex: /^user_.+@example\.com$/ 
 * };
 * 
 * // Existence checking
 * const existsQuery: ComparisonOperators<any> = { $exists: true };
 * ```
 */
export type ComparisonOperators<T> = {
  /** Exact equality match */
  $eq?: T;
  /** Not equal to */
  $ne?: T;
  /** Greater than (for string, number, Date) */
  $gt?: T extends string | number | Date ? T : never;
  /** Greater than or equal (for string, number, Date) */
  $gte?: T extends string | number | Date ? T : never;
  /** Less than (for string, number, Date) */
  $lt?: T extends string | number | Date ? T : never;
  /** Less than or equal (for string, number, Date) */
  $lte?: T extends string | number | Date ? T : never;
  /** Match any value in array */
  $in?: T extends ReadonlyArray<infer U> ? U[] : T[];
  /** Match none of the values in array */
  $nin?: T extends ReadonlyArray<infer U> ? U[] : T[];
  /** Regular expression pattern match (for strings) */
  $regex?: T extends string ? RegExp | string : never;
  /** Regular expression options (for strings) */
  $options?: T extends string ? string : never;
  /** Check if field exists */
  $exists?: boolean;
  /** Check field type */
  $type?: string;
  /** Array length match (for arrays) */
  $size?: T extends ReadonlyArray<unknown> ? number : never;
};

/**
 * Type representing MongoDB-style logical operators for combining multiple query conditions.
 * Enables complex query logic with AND, OR, NOR, and NOT operations.
 * 
 * @template T - The type of objects being queried
 * 
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   active: boolean;
 * }
 * 
 * // AND operation - all conditions must match
 * const andQuery: LogicalOperators<User> = {
 *   $and: [
 *     { name: "John" },
 *     { age: { $gt: 18 } }
 *   ]
 * };
 * 
 * // OR operation - any condition can match
 * const orQuery: LogicalOperators<User> = {
 *   $or: [
 *     { name: "John" },
 *     { name: "Jane" }
 *   ]
 * };
 * 
 * // NOT operation - negates the entire query
 * const notQuery: LogicalOperators<User> = {
 *   $not: { active: false }
 * };
 * ```
 */
export type LogicalOperators<T> = {
  /** All conditions must match (logical AND) */
  $and?: SafeSiftQuery<T>[];
  /** Any condition can match (logical OR) */
  $or?: SafeSiftQuery<T>[];
  /** No conditions should match (logical NOR) */
  $nor?: SafeSiftQuery<T>[];
  /** Negates the query condition (logical NOT) */
  $not?: SafeSiftQuery<T>;
};

/**
 * Type representing operators that work specifically with array fields.
 * Provides array-specific query operations like matching all elements or element matching.
 * 
 * @template T - The array type being queried
 * 
 * @example
 * ```typescript
 * interface User {
 *   tags: string[];
 *   orders: Array<{ id: string; status: string; amount: number }>;
 * }
 * 
 * // All elements must be present in the array
 * const allQuery: ArrayOperators<string[]> = {
 *   $all: ["admin", "active"]
 * };
 * 
 * // At least one array element must match the query
 * const elemMatchQuery: ArrayOperators<User['orders']> = {
 *   $elemMatch: { 
 *     status: "completed", 
 *     amount: { $gt: 100 } 
 *   }
 * };
 * ```
 */
export type ArrayOperators<T> = T extends ReadonlyArray<infer U>
  ? {
      /** All specified values must be present in the array */
      $all?: U[];
      /** At least one array element must match the given query */
      $elemMatch?: SafeSiftQuery<U>;
    }
  : never;

/**
 * Union type representing all possible query operations that can be applied to a field.
 * Combines comparison operators, array operators, direct value matching, and array element matching.
 * 
 * @template T - The type of the field being queried
 * 
 * @example
 * ```typescript
 * // Direct value matching
 * const directQuery: FieldQuery<string> = "John";
 * 
 * // Comparison operators
 * const comparisonQuery: FieldQuery<number> = { $gt: 18, $lt: 65 };
 * 
 * // Array operators
 * const arrayQuery: FieldQuery<string[]> = { $all: ["admin", "user"] };
 * 
 * // Array element matching
 * const elementQuery: FieldQuery<string[]> = "admin"; // matches arrays containing "admin"
 * ```
 */
export type FieldQuery<T> = ComparisonOperators<T> | ArrayOperators<T> | T | (T extends ReadonlyArray<infer U> ? U : never);

/**
 * Main query type that combines all query capabilities into a comprehensive query structure.
 * Supports logical operators, direct field queries, and deep nested field queries with dot notation.
 * This is the primary type used for constructing type-safe queries.
 * 
 * @template T - The type of objects being queried
 * 
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   profile: {
 *     active: boolean;
 *     settings: {
 *       theme: string;
 *     };
 *   };
 *   tags: string[];
 * }
 * 
 * // Simple field query
 * const simpleQuery: SafeSiftQuery<User> = {
 *   name: "John",
 *   age: { $gt: 18 }
 * };
 * 
 * // Nested field query with dot notation
 * const nestedQuery: SafeSiftQuery<User> = {
 *   "profile.active": true,
 *   "profile.settings.theme": "dark"
 * };
 * 
 * // Complex query with logical operators
 * const complexQuery: SafeSiftQuery<User> = {
 *   $and: [
 *     { age: { $gte: 18 } },
 *     { "profile.active": true }
 *   ],
 *   $or: [
 *     { name: "John" },
 *     { tags: "admin" }
 *   ]
 * };
 * 
 * // Negated query
 * const negatedQuery: SafeSiftQuery<User> = {
 *   $not: {
 *     "profile.active": false
 *   }
 * };
 * ```
 */
export type SafeSiftQuery<T> = LogicalOperators<T> & {
  [K in keyof T]?: FieldQuery<T[K]>;
} & {
  [K in DeepKeyOf<T>]?: FieldQuery<DeepValueOf<T, K>>;
};