import { describe, it, expect } from "vitest";
import { areQueriesEqual } from "../src/are-queries-equal";
import type { SafeSiftQuery } from "../src/types";

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  profile: {
    active: boolean;
    department: string;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
  tags: string[];
}

describe("areQueriesEqual", () => {
  describe("primitive field queries", () => {
    it("should return true for identical simple queries", () => {
      const query1: SafeSiftQuery<User> = { name: "John" };
      const query2: SafeSiftQuery<User> = { name: "John" };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return false for different simple queries", () => {
      const query1: SafeSiftQuery<User> = { name: "John" };
      const query2: SafeSiftQuery<User> = { name: "Jane" };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });

    it("should return true for identical numeric queries", () => {
      const query1: SafeSiftQuery<User> = { age: 25 };
      const query2: SafeSiftQuery<User> = { age: 25 };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return false for different numeric queries", () => {
      const query1: SafeSiftQuery<User> = { age: 25 };
      const query2: SafeSiftQuery<User> = { age: 30 };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });
  });

  describe("comparison operator queries", () => {
    it("should return true for identical $gt queries", () => {
      const query1: SafeSiftQuery<User> = { age: { $gt: 18 } };
      const query2: SafeSiftQuery<User> = { age: { $gt: 18 } };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return false for different $gt values", () => {
      const query1: SafeSiftQuery<User> = { age: { $gt: 18 } };
      const query2: SafeSiftQuery<User> = { age: { $gt: 21 } };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });

    it("should return false for different operators", () => {
      const query1: SafeSiftQuery<User> = { age: { $gt: 18 } };
      const query2: SafeSiftQuery<User> = { age: { $gte: 18 } };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });

    it("should return true for identical complex operator queries", () => {
      const query1: SafeSiftQuery<User> = { 
        age: { $gte: 18, $lt: 65 },
        name: { $regex: "^A" }
      };
      const query2: SafeSiftQuery<User> = { 
        age: { $gte: 18, $lt: 65 },
        name: { $regex: "^A" }
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });
  });

  describe("nested field queries", () => {
    it("should return true for identical nested field queries", () => {
      const query1: SafeSiftQuery<User> = { "profile.active": true };
      const query2: SafeSiftQuery<User> = { "profile.active": true };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return false for different nested field queries", () => {
      const query1: SafeSiftQuery<User> = { "profile.active": true };
      const query2: SafeSiftQuery<User> = { "profile.active": false };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });

    it("should return true for identical deep nested queries", () => {
      const query1: SafeSiftQuery<User> = { "profile.settings.theme": "dark" };
      const query2: SafeSiftQuery<User> = { "profile.settings.theme": "dark" };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return true for mixed nested and direct field queries", () => {
      const query1: SafeSiftQuery<User> = { 
        name: "John",
        "profile.active": true,
        "profile.settings.notifications": false
      };
      const query2: SafeSiftQuery<User> = { 
        name: "John",
        "profile.active": true,
        "profile.settings.notifications": false
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });
  });

  describe("logical operator queries", () => {
    it("should return true for identical $and queries", () => {
      const query1: SafeSiftQuery<User> = {
        $and: [
          { age: { $gte: 18 } },
          { "profile.active": true }
        ]
      };
      const query2: SafeSiftQuery<User> = {
        $and: [
          { age: { $gte: 18 } },
          { "profile.active": true }
        ]
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return false for different $and query order", () => {
      const query1: SafeSiftQuery<User> = {
        $and: [
          { age: { $gte: 18 } },
          { "profile.active": true }
        ]
      };
      const query2: SafeSiftQuery<User> = {
        $and: [
          { "profile.active": true },
          { age: { $gte: 18 } }
        ]
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });

    it("should return true for identical $or queries", () => {
      const query1: SafeSiftQuery<User> = {
        $or: [
          { name: "John" },
          { name: "Jane" }
        ]
      };
      const query2: SafeSiftQuery<User> = {
        $or: [
          { name: "John" },
          { name: "Jane" }
        ]
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return true for identical $not queries", () => {
      const query1: SafeSiftQuery<User> = {
        $not: { "profile.active": false }
      };
      const query2: SafeSiftQuery<User> = {
        $not: { "profile.active": false }
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return true for identical $nor queries", () => {
      const query1: SafeSiftQuery<User> = {
        $nor: [
          { age: { $lt: 18 } },
          { "profile.active": false }
        ]
      };
      const query2: SafeSiftQuery<User> = {
        $nor: [
          { age: { $lt: 18 } },
          { "profile.active": false }
        ]
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });
  });

  describe("array field queries", () => {
    it("should return true for identical array element queries", () => {
      const query1: SafeSiftQuery<User> = { tags: "admin" };
      const query2: SafeSiftQuery<User> = { tags: "admin" };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return true for identical $all queries", () => {
      const query1: SafeSiftQuery<User> = { tags: { $all: ["admin", "user"] } };
      const query2: SafeSiftQuery<User> = { tags: { $all: ["admin", "user"] } };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return false for different $all query orders", () => {
      const query1: SafeSiftQuery<User> = { tags: { $all: ["admin", "user"] } };
      const query2: SafeSiftQuery<User> = { tags: { $all: ["user", "admin"] } };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });
  });

  describe("complex mixed queries", () => {
    it("should return true for identical complex queries", () => {
      const query1: SafeSiftQuery<User> = {
        name: { $regex: "^A" },
        age: { $gte: 18, $lt: 65 },
        "profile.active": true,
        "profile.settings.theme": "dark",
        $and: [
          { "profile.department": "Engineering" },
          { tags: "admin" }
        ],
        $or: [
          { email: { $regex: "@company.com$" } },
          { id: { $in: [1, 2, 3] } }
        ]
      };
      const query2: SafeSiftQuery<User> = {
        name: { $regex: "^A" },
        age: { $gte: 18, $lt: 65 },
        "profile.active": true,
        "profile.settings.theme": "dark",
        $and: [
          { "profile.department": "Engineering" },
          { tags: "admin" }
        ],
        $or: [
          { email: { $regex: "@company.com$" } },
          { id: { $in: [1, 2, 3] } }
        ]
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return false when one property differs in complex query", () => {
      const query1: SafeSiftQuery<User> = {
        name: { $regex: "^A" },
        age: { $gte: 18, $lt: 65 },
        "profile.active": true,
        $and: [
          { "profile.department": "Engineering" },
          { tags: "admin" }
        ]
      };
      const query2: SafeSiftQuery<User> = {
        name: { $regex: "^A" },
        age: { $gte: 18, $lt: 65 },
        "profile.active": false, // This is different
        $and: [
          { "profile.department": "Engineering" },
          { tags: "admin" }
        ]
      };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should return true for identical empty queries", () => {
      const query1: SafeSiftQuery<User> = {};
      const query2: SafeSiftQuery<User> = {};
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return false when comparing empty query with non-empty", () => {
      const query1: SafeSiftQuery<User> = {};
      const query2: SafeSiftQuery<User> = { name: "John" };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });

    it("should return false when queries have different number of properties", () => {
      const query1: SafeSiftQuery<User> = { name: "John" };
      const query2: SafeSiftQuery<User> = { name: "John", age: 25 };
      
      expect(areQueriesEqual(query1, query2)).toBe(false);
    });

    it("should handle different property sets correctly", () => {
      const query1: SafeSiftQuery<User> = { name: "John" };
      const query2: SafeSiftQuery<User> = { name: "John" };
      
      expect(areQueriesEqual(query1, query2)).toBe(true);
    });

    it("should return true when comparing the same query object reference", () => {
      const query: SafeSiftQuery<User> = { 
        name: "John",
        age: { $gte: 18 },
        "profile.active": true
      };
      
      expect(areQueriesEqual(query, query)).toBe(true);
    });
  });
});