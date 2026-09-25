import deepEqual from "fast-deep-equal";
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

