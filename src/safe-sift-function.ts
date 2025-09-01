import { SafeSiftQuery } from "./types";
import { createSiftFunction } from "./create-sift-function";
import type { SafeSiftReturnType } from "./safe-sift-return-type";

/**
 * Creates a functional interface for querying arrays with MongoDB-style queries.
 * Returns an object with methods for filtering, testing, and searching arrays.
 *
 * @template T - The type of objects to be queried
 * @param query - The SafeSiftQuery object defining the search criteria
 * @returns An object containing methods for array operations (filter, test, find, etc.)
 *
 * @example
 * ```typescript
 * interface Product {
 *   name: string;
 *   category: string;
 *   price: number;
 * }
 *
 * const products: Product[] = [
 *   { name: 'Phone', category: 'electronics', price: 599 },
 *   { name: 'Book', category: 'media', price: 29 },
 *   { name: 'Laptop', category: 'electronics', price: 999 }
 * ];
 *
 * // Create functional query interface
 * const electronicsQuery = safeSift<Product>({
 *   category: 'electronics',
 *   price: { $lt: 800 }
 * });
 *
 * const affordableElectronics = electronicsQuery.filter(products);
 * const hasMatch = electronicsQuery.some(products);
 * const count = electronicsQuery.count(products);
 * ```
 */
export function safeSift<T>(query: SafeSiftQuery<T>): SafeSiftReturnType<T> {
  const siftFn = createSiftFunction(query);

  return {
    /** Tests whether a single object matches the query conditions */
    test: (obj: T): boolean => siftFn(obj),
    /** Filters an array, returning only objects that match the query conditions */
    filter: (array: T[]): T[] => array.filter(siftFn),
    /** Finds the first object in an array that matches the query conditions */
    find: (array: T[]) => array.find(siftFn),
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