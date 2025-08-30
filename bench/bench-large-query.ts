import { performance } from "node:perf_hooks";
import { getFilterOps, getFilterValue } from "../src";
import { normalizeQuery } from "../src";
import { bagFromPreds, mergeOpsBags } from "../src";
import type { Normalized, OpsBag } from "../src/types";

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * CONFIG: make the query as big/deep as you like
 * ────────────────────────────────────────────────────────────────────────────────
 */
const OR_BRANCHES = 50; // number of entries inside top-level $or
const AND_PER_BRANCH = 20; // how many AND predicates inside each OR branch
const EXTRA_AND_AT_ROOT = 200; // extra AND predicates at the root alongside $or
const NESTED_DEPTH = 3; // how many nested path segments to add after the prefix
const NESTED_PREFIX = "profile.contact"; // stable prefix to line up with TARGET_FIELD
const TARGET_FIELD = [
  NESTED_PREFIX,
  ...Array.from({ length: NESTED_DEPTH }, (_, i) => `p${i + 1}`),
  "age",
].join(".");

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * UTILITIES
 * ────────────────────────────────────────────────────────────────────────────────
 */

// Build "<prefix>.p1.p2....<field>"
function nestedPath(field: string, depth: number, prefix = NESTED_PREFIX) {
  const parts =
    depth > 0 ? Array.from({ length: depth }, (_, i) => `p${i + 1}`) : [];
  return [prefix, ...parts, field].join(".");
}

// Shallow-merge a list of plain objects (fine for bench)
function mergeAll<T extends object>(objs: T[]): T {
  return objs.reduce((acc, o) => Object.assign(acc, o), {} as T);
}

// Create an AND chunk with mixed operators for variation
function makeAndChunk(seed: number) {
  const agePath = nestedPath("age", NESTED_DEPTH);
  const scorePath = nestedPath("score", NESTED_DEPTH);
  const namePath = nestedPath("name", NESTED_DEPTH);

  const gte = 18 + (seed % 10);
  const lte = 50 + (seed % 15);
  const scoreGt = 100 + (seed % 100);
  const name = `user_${seed % 1000}`;
  const rx = new RegExp(`^${name}`, "i");

  return {
    [agePath]: { $gte: gte, $lte: lte },
    [scorePath]: { $gt: scoreGt },
    [namePath]: rx,
  };
}

// Build one huge raw MQL query
function buildLargeQuery() {
  // Make sure TARGET_FIELD === nestedPath('age', NESTED_DEPTH)
  // e.g. "profile.contact.p1.p2.p3.age" when depth=3
  const TARGET_FIELD_LOCAL = nestedPath("age", NESTED_DEPTH);

  const rootAnd: unknown[] = [];

  // add lots of unrelated AND predicates at the root
  for (let i = 0; i < EXTRA_AND_AT_ROOT; i++) {
    if (i % 3 === 0) {
      rootAnd.push({
        [nestedPath("status", NESTED_DEPTH)]: {
          $eq: i % 2 ? "active" : "inactive",
        },
      });
    } else if (i % 3 === 1) {
      rootAnd.push({
        [nestedPath("createdAt", NESTED_DEPTH)]: {
          $gte: new Date(1600000000000 + i * 1000),
        },
      });
    } else {
      rootAnd.push({
        [nestedPath("tag", NESTED_DEPTH)]: new RegExp(`^tag${i}$`, "i"),
      });
    }
  }

  // critical: add a direct AND constraint on the EXACT same target field path
  rootAnd.push({ [TARGET_FIELD_LOCAL]: { $gte: 16 } });

  // build OR branches; each branch is a single AND object (collapsed for fewer layers)
  const orBranches: unknown[] = [];
  for (let b = 0; b < OR_BRANCHES; b++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ands: any[] = [];
    for (let a = 0; a < AND_PER_BRANCH; a++) {
      ands.push(makeAndChunk(b * AND_PER_BRANCH + a)); // includes { [nestedPath('age', NESTED_DEPTH)]: { $gte, $lte } }
    }
    orBranches.push({ $and: [mergeAll(ands)] });
  }

  // unrelated top-level equality (just to add size)
  const huge = {
    $and: rootAnd,
    $or: orBranches,
    [nestedPath("profileId", NESTED_DEPTH)]: `profile_${Math.random()
      .toString(36)
      .slice(2)}`,
  };

  return huge;
}

// Simple timing helper
function time(label: string, runs: number, fn: () => unknown) {
  // Warm-up
  for (let i = 0; i < Math.min(2000, runs); i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < runs; i++) fn();
  const t1 = performance.now();
  const ms = t1 - t0;
  console.log(
    `${label}: ${ms.toFixed(2)} ms  |  ${(runs / ms).toFixed(1)} ops/ms  |  ${(
      ms / runs
    ).toFixed(4)} ms/op`
  );
}

/**
 * Optional “normalize once” fast path implemented locally just for benchmarking.
 * Public API should continue to accept raw MQL and normalize internally.
 */
function getFilterOpsFromNormalized(
  normalized: Normalized,
  fieldPath: string
): OpsBag | OpsBag[] | undefined {
  const { and, or } = normalized;

  // AND-level for the field
  const andPreds = and.filter((p) => p.path === fieldPath);
  const andBag: OpsBag = andPreds.length ? bagFromPreds(andPreds) : {};

  if (!or.length) return Object.keys(andBag).length ? andBag : undefined;

  // First OR-branch that mentions the field wins (same as default behavior)
  for (const branch of or) {
    const preds = branch.filter((p) => p.path === fieldPath);
    if (preds.length) {
      const bag = bagFromPreds(preds);
      return mergeOpsBags(andBag, bag);
    }
  }

  // No branch mentioned the field → fallback to AND-only (or undefined)
  return Object.keys(andBag).length ? andBag : undefined;
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * MAIN
 * ────────────────────────────────────────────────────────────────────────────────
 */
function main() {
  const q = buildLargeQuery();

  console.log(
    `Large query built with:\n` +
      `  OR_BRANCHES=${OR_BRANCHES}\n` +
      `  AND_PER_BRANCH=${AND_PER_BRANCH}\n` +
      `  EXTRA_AND_AT_ROOT=${EXTRA_AND_AT_ROOT}\n` +
      `  NESTED_DEPTH=${NESTED_DEPTH}\n` +
      `  NESTED_PREFIX=${NESTED_PREFIX}\n` +
      `  TARGET_FIELD=${TARGET_FIELD}\n`
  );

  // Single “cold” calls
  {
    const t0 = performance.now();
    const opsOnce = getFilterOps(q, TARGET_FIELD);
    const t1 = performance.now();

    const t2 = performance.now();
    const valOnce = getFilterValue(q, TARGET_FIELD);
    const t3 = performance.now();

    console.log(`Single getFilterOps():   ${(t1 - t0).toFixed(3)} ms`);
    console.log(`Single getFilterValue(): ${(t3 - t2).toFixed(3)} ms`);
    console.log("Example result:", { ops: opsOnce, value: valOnce });
  }

  // Normalize once to compare fast path (optional)
  const normalized = normalizeQuery(q);

  // Repeated timings
  time("getFilterOps (x50k)", 50_000, () => getFilterOps(q, TARGET_FIELD));
  time("getFilterValue (x50k)", 50_000, () => getFilterValue(q, TARGET_FIELD));
  time("getFilterOpsFromNormalized (x50k)", 50_000, () =>
    getFilterOpsFromNormalized(normalized, TARGET_FIELD)
  );
}

main();
