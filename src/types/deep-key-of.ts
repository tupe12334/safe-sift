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