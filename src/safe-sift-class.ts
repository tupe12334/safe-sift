import { SafeSiftQuery } from "@types";
import { createSiftFunction } from "./create-sift-function";
import type { FindResult } from "./find-result";

/**
 * A type-safe wrapper around the sift library that provides MongoDB-style querying for JavaScript objects.
 * Enables filtering, searching, and testing objects against complex query conditions with full type safety.
 *
 * @template T - The type of objects this SafeSift instance will operate on
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   profile: {
 *     active: boolean;
 *     tags: string[];
 *   };
 * }
 *
 * const users: User[] = [
 *   { name: 'John', age: 25, profile: { active: true, tags: ['admin'] } },
 *   { name: 'Jane', age: 30, profile: { active: false, tags: ['user'] } },
 *   { name: 'Bob', age: 35, profile: { active: true, tags: ['user', 'moderator'] } }
 * ];
 *
 * // Create query and SafeSift instance
 * const query = { age: { $gte: 25 }, 'profile.active': true };
 * const safeSift = new SafeSift<User>(query);
 *
 * // Filter matching users
 * const activeAdults = safeSift.filter(users);
 * // Result: [John, Bob]
 *
 * // Test single object
 * const testUser = { name: 'Alice', age: 28, profile: { active: true, tags: ['user'] } };
 * const matches = safeSift.test(testUser); // true
 *
 * // Find first match
 * const firstMatch = safeSift.find(users); // John
 * ```
 */
export class SafeSift<T> {
  /**
   * Creates a new SafeSift instance with the specified query.
   *
   * @param query - The SafeSiftQuery to use for filtering and testing objects
   */
  constructor(private readonly query: SafeSiftQuery<T>) {}

  /**
   * Tests whether a single object matches the query conditions.
   *
   * @param obj - The object to test against the query
   * @returns `true` if the object matches the query, `false` otherwise
   *
   * @example
   * ```typescript
   * interface User {
   *   name: string;
   *   age: number;
   * }
   *
   * const safeSift = new SafeSift<User>({ age: { $gt: 18 } });
   * const adult = { name: 'John', age: 25 };
   * const minor = { name: 'Jane', age: 16 };
   *
   * safeSift.test(adult); // true
   * safeSift.test(minor); // false
   * ```
   */
  test(obj: T): boolean {
    const siftFn = createSiftFunction(this.query);
    return siftFn(obj);
  }

  /**
   * Filters an array of objects, returning only those that match the query conditions.
   *
   * @param array - The array of objects to filter
   * @returns A new array containing only objects that match the query
   *
   * @example
   * ```typescript
   * interface User {
   *   name: string;
   *   age: number;
   *   active: boolean;
   * }
   *
   * const users: User[] = [
   *   { name: 'John', age: 25, active: true },
   *   { name: 'Jane', age: 30, active: false },
   *   { name: 'Bob', age: 35, active: true }
   * ];
   *
   * const safeSift = new SafeSift<User>({ age: { $gte: 18 }, active: true });
   * const adults = safeSift.filter(users);
   * // Result: [{ name: 'John', age: 25, active: true }, { name: 'Bob', age: 35, active: true }]
   * ```
   */
  filter(array: T[]): T[] {
    const siftFn = createSiftFunction(this.query);
    return array.filter(siftFn);
  }

  /**
   * Finds the first object in an array that matches the query conditions.
   *
   * @param array - The array of objects to search
   * @returns The first matching object, or `undefined` if no match is found
   *
   * @example
   * ```typescript
   * interface User {
   *   name: string;
   *   role: string;
   * }
   *
   * const users: User[] = [
   *   { name: 'John', role: 'user' },
   *   { name: 'Jane', role: 'admin' },
   *   { name: 'Bob', role: 'user' }
   * ];
   *
   * const safeSift = new SafeSift<User>({ role: 'admin' });
   * const firstAdmin = safeSift.find(users);
   * // Result: { name: 'Jane', role: 'admin' }
   * ```
   */
  find(array: T[]): FindResult<T> {
    const siftFn = createSiftFunction(this.query);
    return array.find(siftFn);
  }

  /**
   * Finds the index of the first object in an array that matches the query conditions.
   *
   * @param array - The array of objects to search
   * @returns The index of the first matching object, or -1 if no match is found
   *
   * @example
   * ```typescript
   * interface User {
   *   name: string;
   *   premium: boolean;
   * }
   *
   * const users: User[] = [
   *   { name: 'John', premium: false },
   *   { name: 'Jane', premium: true },
   *   { name: 'Bob', premium: false }
   * ];
   *
   * const safeSift = new SafeSift<User>({ premium: true });
   * const firstPremiumIndex = safeSift.findIndex(users);
   * // Result: 1
   * ```
   */
  findIndex(array: T[]): number {
    const siftFn = createSiftFunction(this.query);
    return array.findIndex(siftFn);
  }

  /**
   * Tests whether at least one object in an array matches the query conditions.
   *
   * @param array - The array of objects to test
   * @returns `true` if at least one object matches, `false` otherwise
   *
   * @example
   * ```typescript
   * interface User {
   *   name: string;
   *   verified: boolean;
   * }
   *
   * const users: User[] = [
   *   { name: 'John', verified: false },
   *   { name: 'Jane', verified: true },
   *   { name: 'Bob', verified: false }
   * ];
   *
   * const safeSift = new SafeSift<User>({ verified: true });
   * const hasVerifiedUser = safeSift.some(users);
   * // Result: true
   * ```
   */
  some(array: T[]): boolean {
    const siftFn = createSiftFunction(this.query);
    return array.some(siftFn);
  }

  /**
   * Tests whether all objects in an array match the query conditions.
   *
   * @param array - The array of objects to test
   * @returns `true` if all objects match, `false` otherwise
   *
   * @example
   * ```typescript
   * interface User {
   *   name: string;
   *   active: boolean;
   * }
   *
   * const users: User[] = [
   *   { name: 'John', active: true },
   *   { name: 'Jane', active: true },
   *   { name: 'Bob', active: false }
   * ];
   *
   * const safeSift = new SafeSift<User>({ active: true });
   * const allActive = safeSift.every(users);
   * // Result: false
   * ```
   */
  every(array: T[]): boolean {
    const siftFn = createSiftFunction(this.query);
    return array.every(siftFn);
  }

  /**
   * Counts the number of objects in an array that match the query conditions.
   *
   * @param array - The array of objects to count
   * @returns The number of matching objects
   *
   * @example
   * ```typescript
   * interface Product {
   *   name: string;
   *   category: string;
   * }
   *
   * const products: Product[] = [
   *   { name: 'Phone', category: 'electronics' },
   *   { name: 'Book', category: 'media' },
   *   { name: 'Laptop', category: 'electronics' }
   * ];
   *
   * const safeSift = new SafeSift<Product>({ category: 'electronics' });
   * const electronicsCount = safeSift.count(products);
   * // Result: 2
   * ```
   */
  count(array: T[]): number {
    const siftFn = createSiftFunction(this.query);
    return array.filter(siftFn).length;
  }
}