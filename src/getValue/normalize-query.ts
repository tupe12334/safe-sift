import type { MqlOperator, Normalized, Predicate } from "@types";
import { isOperatorKey } from "./is-operator-key";
import { normalizeEquality } from "./normalize-equality";

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
 * Normalize an MQL query into `and` and `or` parts.
 *
 * @example
 * ```ts
 * normalizeQuery({ age: { $gte: 18 } });
 * // => { and: [{ path: "age", op: "$gte", value: 18 }], or: [] }
 *
 * normalizeQuery({ $or: [{ name: "Alice" }, { name: "Bob" }] });
 * // => { and: [], or: [[{ path: "name", op: "$eq", value: "Alice" }],
 * //                     [{ path: "name", op: "$eq", value: "Bob" }]] }
 * ```
 */
export function normalizeQuery(q: unknown, basePath = ""): Normalized {
  const acc: Normalized = { and: [], or: [] };

  if (!q || typeof q !== "object" || Array.isArray(q)) return acc;

  for (const [key, val] of Object.entries(q)) {
    if (key === "$and" && Array.isArray(val)) {
      for (const sub of val) {
        const n = normalizeQuery(sub, basePath);
        acc.and.push(...n.and);
        acc.or.push(...n.or);
      }
      continue;
    }

    if (key === "$or" && Array.isArray(val)) {
      for (const sub of val) {
        const n = normalizeQuery(sub, basePath);
        if (n.and.length) acc.or.push([...n.and]);
        if (n.or.length) acc.or.push(...n.or);
      }
      continue;
    }

    if (key === "$nor") continue; // skip NOR for positive extraction

    const path = basePath ? `${basePath}.${key}` : key;

    if (isPlainObject(val)) {
      const opKeys = Object.keys(val).filter(isOperatorKey);
      if (opKeys.length) {
        const valEntries = Object.entries(val);
        for (const [op, opValue] of valEntries) {
          if (isOperatorKey(op)) {
            acc.and.push(createPredicateFromOperator(path, op, opValue));
          }
        }
        continue;
      }
      const n = normalizeQuery(val, path);
      acc.and.push(...n.and);
      acc.or.push(...n.or);
      continue;
    }

    acc.and.push(...normalizeEquality(path, val));
  }

  return acc;
}