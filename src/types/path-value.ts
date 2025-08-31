import type { DeepKeyOf } from "./deep-key-of";
import type { DeepValueOf } from "./deep-value-of";

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