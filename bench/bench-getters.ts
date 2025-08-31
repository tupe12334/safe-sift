import { performance } from "node:perf_hooks";
import { getFilterOps, getFilterValue } from "../src/";

type User = {
  name: string;
  age: number;
  status: "active" | "inactive";
  profile?: { score?: number };
};

function randInt(a: number, b: number) {
  return (Math.random() * (b - a + 1) + a) | 0;
}

function randomQuery(i: number) {
  const r = Math.random();
  const name = `user${i % 100}`;
  if (r < 0.33) return { name };
  if (r < 0.66)
    return { age: { $gte: randInt(0, 80), $lte: randInt(50, 120) } };
  return {
    $and: [{ status: { $eq: i % 2 ? "active" : "inactive" } }],
    $or: [{ name }, { age: { $gte: randInt(18, 70) } }],
  };
}

function timeit(label: string, fn: () => void) {
  // warmup
  for (let i = 0; i < 5_000; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < 100_000; i++) fn();
  const t1 = performance.now();
  console.log(
    `${label}: ${(t1 - t0).toFixed(2)} ms (${(100_000 / (t1 - t0)).toFixed(
      1
    )} ops/ms)`
  );
}

const queries = Array.from({ length: 10_000 }, (_, i) => randomQuery(i));
const fields = ["name", "age", "status", "profile.score"] as const;

console.log(`Queries: ${queries.length}`);

timeit("getFilterOps", () => {
  const q = queries[(Math.random() * queries.length) | 0];
  const f = fields[(Math.random() * fields.length) | 0];
  getFilterOps(q, f);
});

timeit("getFilterValue", () => {
  const q = queries[(Math.random() * queries.length) | 0];
  const f = fields[(Math.random() * fields.length) | 0];
  getFilterValue(q, f);
});
