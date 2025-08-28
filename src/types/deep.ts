import { Primitive } from "./primitives";
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
