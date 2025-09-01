import type { MqlOperator } from "../types";

/**
 * Returns true if the key is an MQL operator (starts with "$").
 *
 * @example
 * ```ts
 * isOperatorKey("$gte"); // true
 * isOperatorKey("name"); // false
 * ```
 */
export function isOperatorKey(k: string): k is MqlOperator {
  return k.startsWith("$");
}