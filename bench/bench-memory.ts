/* eslint-disable no-console */
import { getFilterOps, getFilterValue } from "../src";

type User = {
  name: string;
  age: number;
  status: "active" | "inactive";
  profile?: { score?: number };
};

function randomQuery(i: number) {
  const name = `user${i % 100}`;
  return {
    $and: [{ status: { $eq: i % 2 ? "active" : "inactive" } }],
    $or: [{ name }, { age: { $gte: (i % 70) + 18 } }],
  };
}

function mem() {
  const m = process.memoryUsage();
  return {
    rssMB: (m.rss / 1024 / 1024).toFixed(1),
    heapMB: (m.heapUsed / 1024 / 1024).toFixed(1),
  };
}

const N = 200_000;
console.log("Start", mem());

for (let i = 0; i < N; i++) {
  const q = randomQuery(i);
  getFilterOps(q, "age");
  getFilterValue(q, "age");
  if ((i + 1) % 50_000 === 0) {
    // @ts-ignore
    if (global.gc) global.gc();
    console.log(`i=${i + 1}`, mem());
  }
}

console.log("End", mem());
