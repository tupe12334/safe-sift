import sift from "sift";
import { SafeSiftQuery } from "@types";

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
   * @returns True if the object matches the query, false otherwise
   *
   * @example
   * ```typescript
   * const safeSift = new SafeSift<User>({ age: { $gt: 18 } });
   *
   * const adult = { name: 'John', age: 25 };
   * const minor = { name: 'Jane', age: 16 };
   *
   * safeSift.test(adult); // true
   * safeSift.test(minor); // false
   * ```
   */
  test(obj: T): boolean {
    return sift(this.query as Parameters<typeof sift>[0])(obj);
  }

  /**
   * Filters an array to include only objects that match the query conditions.
   *
   * @param array - The array of objects to filter
   * @returns A new array containing only the matching objects
   *
   * @example
   * ```typescript
   * const users = [
   *   { name: 'John', age: 25, active: true },
   *   { name: 'Jane', age: 17, active: true },
   *   { name: 'Bob', age: 30, active: false }
   * ];
   *
   * const safeSift = new SafeSift<User>({ age: { $gte: 18 }, active: true });
   * const adults = safeSift.filter(users);
   * // Result: [{ name: 'John', age: 25, active: true }]
   * ```
   */
  filter(array: T[]): T[] {
    return array.filter(sift(this.query as Parameters<typeof sift>[0]));
  }

  /**
   * Finds the first object in an array that matches the query conditions.
   *
   * @param array - The array of objects to search
   * @returns The first matching object, or undefined if no match is found
   *
   * @example
   * ```typescript
   * const users = [
   *   { name: 'John', age: 25, role: 'user' },
   *   { name: 'Jane', age: 30, role: 'admin' },
   *   { name: 'Bob', age: 35, role: 'admin' }
   * ];
   *
   * const safeSift = new SafeSift<User>({ role: 'admin' });
   * const firstAdmin = safeSift.find(users);
   * // Result: { name: 'Jane', age: 30, role: 'admin' }
   * ```
   */
  find(array: T[]): T | undefined {
    return array.find(sift(this.query as Parameters<typeof sift>[0]));
  }

  /**
   * Finds the index of the first object in an array that matches the query conditions.
   *
   * @param array - The array of objects to search
   * @returns The index of the first matching object, or -1 if no match is found
   *
   * @example
   * ```typescript
   * const users = [
   *   { name: 'John', age: 25, premium: false },
   *   { name: 'Jane', age: 30, premium: true },
   *   { name: 'Bob', age: 35, premium: true }
   * ];
   *
   * const safeSift = new SafeSift<User>({ premium: true });
   * const firstPremiumIndex = safeSift.findIndex(users);
   * // Result: 1 (Jane's index)
   * ```
   */
  findIndex(array: T[]): number {
    return array.findIndex(sift(this.query as Parameters<typeof sift>[0]));
  }

  /**
   * Tests whether at least one object in an array matches the query conditions.
   *
   * @param array - The array of objects to test
   * @returns True if at least one object matches the query, false otherwise
   *
   * @example
   * ```typescript
   * const users = [
   *   { name: 'John', age: 25, verified: false },
   *   { name: 'Jane', age: 30, verified: false },
   *   { name: 'Bob', age: 35, verified: true }
   * ];
   *
   * const safeSift = new SafeSift<User>({ verified: true });
   * const hasVerifiedUser = safeSift.some(users);
   * // Result: true (Bob is verified)
   * ```
   */
  some(array: T[]): boolean {
    return array.some(sift(this.query as Parameters<typeof sift>[0]));
  }

  /**
   * Tests whether all objects in an array match the query conditions.
   *
   * @param array - The array of objects to test
   * @returns True if all objects match the query, false otherwise
   *
   * @example
   * ```typescript
   * const users = [
   *   { name: 'John', age: 25, active: true },
   *   { name: 'Jane', age: 30, active: true },
   *   { name: 'Bob', age: 35, active: false }
   * ];
   *
   * const safeSift = new SafeSift<User>({ active: true });
   * const allActive = safeSift.every(users);
   * // Result: false (Bob is not active)
   * ```
   */
  every(array: T[]): boolean {
    return array.every(sift(this.query as Parameters<typeof sift>[0]));
  }

  /**
   * Counts the number of objects in an array that match the query conditions.
   *
   * @param array - The array of objects to count
   * @returns The number of matching objects
   *
   * @example
   * ```typescript
   * const products = [
   *   { name: 'Laptop', price: 1000, category: 'electronics' },
   *   { name: 'Phone', price: 500, category: 'electronics' },
   *   { name: 'Book', price: 20, category: 'books' },
   *   { name: 'Tablet', price: 300, category: 'electronics' }
   * ];
   *
   * const safeSift = new SafeSift<Product>({ category: 'electronics' });
   * const electronicsCount = safeSift.count(products);
   * // Result: 3
   * ```
   */
  count(array: T[]): number {
    return this.filter(array).length;
  }
}

/**
 * Factory function that creates a SafeSift instance from a query.
 * Provides a convenient way to create SafeSift instances without using the `new` keyword.
 *
 * @template T - The type of objects to be queried
 * @param query - The SafeSiftQuery to use for the SafeSift instance
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
 * // Create SafeSift instance using factory function
 * const userQuery = createQuery<User>({
 *   age: { $gte: 18 },
 *   active: true
 * });
 *
 * const users = [
 *   { name: 'John', age: 25, active: true },
 *   { name: 'Jane', age: 16, active: true },
 *   { name: 'Bob', age: 30, active: false }
 * ];
 *
 * const activeAdults = userQuery.filter(users);
 * // Result: [{ name: 'John', age: 25, active: true }]
 * ```
 */
export function createQuery<T>(query: SafeSiftQuery<T>): SafeSift<T> {
  return new SafeSift(query);
}

/**
 * Functional interface that creates query operations without instantiating a class.
 * Returns an object with methods for filtering, finding, and testing objects against the query.
 * This is useful when you prefer a functional programming style over object-oriented approach.
 *
 * @template T - The type of objects to be queried
 * @param query - The SafeSiftQuery to use for all operations
 * @returns An object containing query operation methods
 *
 * @example
 * ```typescript
 * interface Product {
 *   name: string;
 *   price: number;
 *   category: string;
 *   inStock: boolean;
 * }
 *
 * const products = [
 *   { name: 'Laptop', price: 1000, category: 'electronics', inStock: true },
 *   { name: 'Phone', price: 500, category: 'electronics', inStock: false },
 *   { name: 'Book', price: 20, category: 'books', inStock: true }
 * ];
 *
 * // Create functional query interface
 * const electronicsQuery = safeSift<Product>({
 *   category: 'electronics',
 *   inStock: true
 * });
 *
 * // Use the methods directly
 * const availableElectronics = electronicsQuery.filter(products);
 * // Result: [{ name: 'Laptop', price: 1000, category: 'electronics', inStock: true }]
 *
 * const hasAnyInStock = electronicsQuery.some(products); // true
 * const expensiveElectronics = electronicsQuery.find(products); // Laptop
 * const totalCount = electronicsQuery.count(products); // 1
 * ```
 */
export function safeSift<T>(query: SafeSiftQuery<T>) {
  const siftFn = sift(query as Parameters<typeof sift>[0]);

  return {
    /** Tests whether a single object matches the query conditions */
    test: (obj: T): boolean => siftFn(obj),
    /** Filters an array to include only objects that match the query conditions */
    filter: (array: T[]): T[] => array.filter(siftFn),
    /** Finds the first object in an array that matches the query conditions */
    find: (array: T[]): T | undefined => array.find(siftFn),
    /** Finds the index of the first object that matches the query conditions */
    findIndex: (array: T[]): number => array.findIndex(siftFn),
    /** Tests whether at least one object in an array matches the query conditions */
    some: (array: T[]): boolean => array.some(siftFn),
    /** Tests whether all objects in an array match the query conditions */
    every: (array: T[]): boolean => array.every(siftFn),
    /** Counts the number of objects in an array that match the query conditions */
    count: (array: T[]): number => array.filter(siftFn).length,
  };
}
