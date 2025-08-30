/**
 * Union type representing primitive values that cannot be further decomposed.
 * Used to determine when to stop recursion in deep type operations.
 */
export type Primitive = string | number | boolean | Date | null | undefined;
