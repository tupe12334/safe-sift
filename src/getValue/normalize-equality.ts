import type { MqlOperator, Predicate } from "@types";
import { isOperatorKey } from "./is-operator-key";

/** Narrow: true only for plain object literals (not Date/RegExp/Map/etc.) */
function isPlainObject(x: unknown): x is Record<string, unknown> {
  return Object.prototype.toString.call(x) === "[object Object]";
}

function createPredicateFromOperator(
  path: string,
  op: MqlOperator,
  value: unknown
): Predicate {
  return { path, op, value };
}

/**
 * Converts equality or operator objects into atomic predicates.
 *
 * @example
 * ```ts
 * normalizeEquality("age", 18);
 * // => [{ path: "age", op: "$eq", value: 18 }]
 *
 * normalizeEquality("age", { $gte: 18, $lte: 30 });
 * // => [
 * //   { path: "age", op: "$gte", value: 18 },
 * //   { path: "age", op: "$lte", value: 30 }
 * // ]
 * ```
 */
export function normalizeEquality(path: string, v: unknown): Predicate[] {
  //   if (v && typeof v === "object" && !Array.isArray(v)) {
  if (isPlainObject(v)) {
    const entries = Object.entries(v);
    if (entries.every(([k]) => isOperatorKey(k))) {
      // All keys are verified operators
      const predicates: Predicate[] = [];
      for (const [op, val] of entries) {
        if (isOperatorKey(op)) {
          predicates.push(createPredicateFromOperator(path, op, val));
        }
      }
      return predicates;
    }
  }
  return [{ path, op: "$eq", value: v }];
}