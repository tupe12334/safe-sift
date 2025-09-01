import type { SafeSiftQuery } from "./types";

/**
 * Compares two SafeSiftQuery objects for deep equality.
 * Returns true if both queries represent the same search criteria.
 *
 * @template T - The type of objects being queried
 * @param query1 - The first query to compare
 * @param query2 - The second query to compare
 * @returns True if the queries are logically equivalent, false otherwise
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   profile: { active: boolean };
 * }
 *
 * const query1: SafeSiftQuery<User> = { name: "John", age: { $gt: 18 } };
 * const query2: SafeSiftQuery<User> = { name: "John", age: { $gt: 18 } };
 * const query3: SafeSiftQuery<User> = { name: "Jane", age: { $gt: 18 } };
 *
 * console.log(areQueriesEqual(query1, query2)); // true
 * console.log(areQueriesEqual(query1, query3)); // false
 * ```
 */
export function areQueriesEqual<T>(
  query1: SafeSiftQuery<T>,
  query2: SafeSiftQuery<T>
): boolean {
  return deepEqual(query1, query2);
}

/**
 * Performs deep equality comparison between two values.
 * Handles objects, arrays, primitives, and nested structures.
 */
function deepEqual(a: unknown, b: unknown): boolean {
  // Same reference or strict equality
  if (a === b) return true;

  // Null/undefined cases
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  // Type mismatch
  if (typeof a !== typeof b) return false;

  // Primitive types
  if (typeof a !== "object") return a === b;

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  // One is array, other isn't
  if (Array.isArray(a) || Array.isArray(b)) return false;

  // Objects
  if (!isObject(a) || !isObject(b)) return false;

  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();

  // Different number of properties
  if (aKeys.length !== bKeys.length) return false;

  // Different property names
  if (!aKeys.every((key, index) => key === bKeys[index])) return false;

  // Compare property values recursively
  return aKeys.every((key) => deepEqual(a[key], b[key]));
}

/**
 * Type guard to check if a value is a plain object.
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}