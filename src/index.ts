/**
 * @fileoverview SafeSift - A type-safe MongoDB-style query library for JavaScript objects.
 *
 * SafeSift provides a type-safe way to query JavaScript objects using MongoDB-style syntax.
 * It offers both a fluent query builder interface and direct query execution capabilities,
 * all with full TypeScript type safety and IntelliSense support.
 *
 * ## Main Features:
 *
 * - **Type-safe queries**: Full TypeScript support with compile-time type checking
 * - **Fluent query builder**: Chainable API for constructing complex queries
 * - **Deep property access**: Query nested objects using dot notation
 * - **MongoDB-style operators**: Familiar $gt, $lt, $in, $regex, etc. operators
 * - **Array operations**: Advanced array querying with $all, $elemMatch, $size
 * - **Logical operators**: Complex query logic with $and, $or, $not, $nor
 *
 * ## Quick Start:
 *
 * ```typescript
 * import { query, SafeSift } from 'safe-sift';
 *
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
 *   { name: 'Jane', age: 30, profile: { active: false, tags: ['user'] } }
 * ];
 *
 * // Using the fluent query builder
 * const activeAdmins = query<User>()
 *   .where('age').greaterThan(18)
 *   .and('profile.active').equals(true)
 *   .and('profile.tags').contains('admin')
 *   .execute()
 *   .filter(users);
 *
 * // Using direct SafeSift instantiation
 * const safeSift = new SafeSift<User>({
 *   age: { $gt: 18 },
 *   'profile.active': true,
 *   'profile.tags': 'admin'
 * });
 * const filtered = safeSift.filter(users);
 * ```
 *
 * ## Exported Classes:
 * - `SafeSift` - Main query execution class
 * - `QueryBuilder` - Fluent interface for building queries
 * - `FieldBuilder` - Field-specific query operations
 *
 * ## Exported Functions:
 * - `createQuery` - Factory function for SafeSift instances
 * - `safeSift` - Functional interface for query operations
 * - `query` - Factory function for QueryBuilder instances
 *
 * ## Exported Types:
 * - `SafeSiftQuery` - Main query object type
 * - `DeepKeyOf` - Type for deep object path keys
 * - `DeepValueOf` - Type for deep object path values
 *
 * @author SafeSift Contributors
 * @version 1.0.0
 * @license MIT
 */

// Core query execution classes and functions
export { SafeSift, createQuery, safeSift } from "./safe-sift";

// Fluent query builder classes and functions
export { QueryBuilder, FieldBuilder, query } from "./query-builder";

// Type definitions for type-safe queries
export type { SafeSiftQuery, DeepKeyOf, DeepValueOf } from "@types";

export * from "./getValue";
