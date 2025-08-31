import { SafeSiftQuery } from "@types";
import { SafeSift } from "./safe-sift-class";

/**
 * Creates a new SafeSift instance from a query object.
 * This is a factory function that provides a more functional approach to creating SafeSift instances.
 *
 * @template T - The type of objects to be queried
 * @param query - The SafeSiftQuery object defining the search criteria
 * @returns A new SafeSift instance configured with the provided query
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   active: boolean;
 * }
 *
 * // Using createQuery function
 * const userQuery = createQuery<User>({
 *   age: { $gte: 18 },
 *   active: true
 * });
 *
 * const users: User[] = [
 *   { name: 'Alice', age: 25, active: true },
 *   { name: 'Bob', age: 16, active: false }
 * ];
 *
 * const results = userQuery.filter(users);
 * // Same as: new SafeSift({ age: { $gte: 18 }, active: true }).filter(users)
 * ```
 */
export function createQuery<T>(query: SafeSiftQuery<T>): SafeSift<T> {
  return new SafeSift(query);
}