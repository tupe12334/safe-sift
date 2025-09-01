import { describe, it, expect } from "vitest";
import { getFilterOps, getFilterValue } from "../src/getValue";
import { normalizeQuery } from "../src/getValue";
import type { OpsBag, SafeSiftQuery } from "../src/types";

describe("normalizeQuery", () => {
  it("normalizes simple equality", () => {
    const n = normalizeQuery({ name: "Alice" });
    expect(n.and).toEqual([{ path: "name", op: "$eq", value: "Alice" }]);
    expect(n.or).toEqual([]);
  });

  it("normalizes operator objects", () => {
    const n = normalizeQuery({ age: { $gte: 18, $lte: 30 } });
    expect(n.and).toContainEqual({ path: "age", op: "$gte", value: 18 });
    expect(n.and).toContainEqual({ path: "age", op: "$lte", value: 30 });
    expect(n.or).toEqual([]);
  });

  it("normalizes $and and nested paths", () => {
    const n = normalizeQuery({
      $and: [{ "profile.name": "Bob" }, { profile: { age: { $gt: 20 } } }],
    });
    expect(n.and).toContainEqual({
      path: "profile.name",
      op: "$eq",
      value: "Bob",
    });
    expect(n.and).toContainEqual({ path: "profile.age", op: "$gt", value: 20 });
  });

  it("normalizes $or into disjunction branches", () => {
    const n = normalizeQuery({ $or: [{ name: "A" }, { name: "B" }] });
    expect(n.and).toEqual([]);
    expect(n.or.length).toBe(2);
    expect(n.or[0]).toEqual([{ path: "name", op: "$eq", value: "A" }]);
    expect(n.or[1]).toEqual([{ path: "name", op: "$eq", value: "B" }]);
  });

  it("ignores $nor for positive extraction", () => {
    const n = normalizeQuery({ $nor: [{ age: { $gte: 18 } }] });
    expect(n.and).toEqual([]);
    expect(n.or).toEqual([]);
  });

  it("handles non-object or array input gracefully", () => {
    expect(normalizeQuery(null)).toEqual({ and: [], or: [] });
    expect(normalizeQuery(undefined)).toEqual({ and: [], or: [] });
    expect(normalizeQuery(42)).toEqual({ and: [], or: [] });
    expect(normalizeQuery(["x"])).toEqual({ and: [], or: [] });
  });
});

describe("getFilterOps", () => {
  it("returns OpsBag for equality", () => {
    const ops = getFilterOps({ name: "Alice" }, "name") as OpsBag;
    expect(ops).toEqual({ $eq: "Alice" });
  });

  it("returns OpsBag for operator bag", () => {
    const ops = getFilterOps({ age: { $gte: 18, $lte: 30 } }, "age") as OpsBag;
    expect(ops).toEqual({ $gte: 18, $lte: 30 });
  });

  it("merges AND with first matching $or branch by default", () => {
    const q = {
      $and: [{ age: { $gte: 18 } }],
      $or: [{ age: { $lte: 25 } }, { age: { $lte: 30 } }],
    };
    const ops = getFilterOps(q, "age") as OpsBag; // default orMode="first"
    expect(ops).toEqual({ $gte: 18, $lte: 25 });
  });

  it('returns all $or branches when orMode="all"', () => {
    const q = { $or: [{ age: { $gte: 18 } }, { age: { $gte: 21 } }] };
    const ops = getFilterOps(q, "age", { orMode: "all" }) as OpsBag[];
    expect(ops).toEqual([{ $gte: 18 }, { $gte: 21 }]);
  });

  it("returns undefined when field is not constrained", () => {
    interface TestUser {
      age: number;
      email: string;
      name: string;
    }
    const query: SafeSiftQuery<TestUser> = { $or: [{ age: { $gte: 18 } }, { email: "test@example.com" }] };
    const ops = getFilterOps(query, "name");
    expect(ops).toBeUndefined();
  });

  it("handles dotted paths from nested objects", () => {
    const ops = getFilterOps(
      {
        profile: { age: { $gt: 20 } },
      },
      "profile.age"
    ) as OpsBag;
    expect(ops).toEqual({ $gt: 20 });
  });
});

describe("getFilterValue", () => {
  it("returns equality value when op omitted and $eq exists", () => {
    const v = getFilterValue({ name: "Alice" }, "name");
    expect(v).toBe("Alice");
  });

  it("returns specific operator value when requested", () => {
    const v = getFilterValue({ age: { $gte: 18, $lte: 30 } }, "age", "$gte");
    expect(v).toBe(18);
  });

  it("returns the full bag if $eq missing and op omitted", () => {
    const v = getFilterValue({ age: { $gte: 18, $lte: 30 } }, "age");
    expect(v).toEqual({ $gte: 18, $lte: 30 });
  });

  it('with $or + orMode="all": returns array of bags via getFilterOps (documented behavior)', () => {
    const q = { $or: [{ age: { $lte: 25 } }, { age: { $lte: 30 } }] };
    // Note: getFilterValue is specified to return first branch when multiple, unless you pass op and iterate yourself.
    const opsAll = getFilterOps(q, "age", { orMode: "all" });
    expect(opsAll).toEqual([{ $lte: 25 }, { $lte: 30 }]);
  });

  it("returns undefined when the field is absent", () => {
    interface TestUser {
      age: number;
      email: string;
      name: string;
    }
    const query: SafeSiftQuery<TestUser> = { $or: [{ age: { $gte: 18 } }, { email: "test@example.com" }] };
    const v = getFilterValue(query, "name");
    expect(v).toBeUndefined();
  });

  it("works with regex equality", () => {
    const rx = /ab+c/i;
    const v = getFilterValue({ name: rx }, "name");
    expect(v).toBe(rx);
  });

  it("works with array equality", () => {
    const arr = ["a", "b"];
    const v = getFilterValue({ tags: arr }, "tags");
    expect(v).toBe(arr);
  });

  it("merges AND with the first OR-branch mentioning the field for value extraction", () => {
    const q = {
      $and: [{ age: { $gte: 18 } }],
      $or: [{ name: "A" }, { age: { $lte: 30 } }],
    };
    const bag = getFilterValue(q, "age") as OpsBag; // no $eq → returns bag
    expect(bag).toEqual({ $gte: 18, $lte: 30 });
  });
});
