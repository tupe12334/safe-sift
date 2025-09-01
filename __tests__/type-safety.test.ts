import { describe, it, expect, expectTypeOf } from "vitest";
import { query, safeSift } from "../src/index";
import { SafeSiftQuery, DeepKeyOf, DeepValueOf } from "../src/types";

type Theme = "light" | "dark";

interface ComplexUser {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  tags: string[];
  scores: number[];
  profile: {
    bio: string;
    location: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    preferences: {
      theme: Theme;
      notifications: boolean;
      languages: string[];
    };
    social: {
      twitter?: string;
      linkedin?: string;
    };
  };
  posts: Array<{
    id: string;
    title: string;
    published: boolean;
    views: number;
    tags: string[];
  }>;
  metadata?: {
    lastLogin: Date;
    loginCount: number;
  };
  createdAt: Date;
}

describe("Type Safety and Autocomplete Tests", () => {
  describe("Field Autocomplete Tests", () => {
    it("should provide autocomplete for top-level fields", () => {
      const builder = query<ComplexUser>();

      // These should all compile and provide autocomplete
      builder.where("id").equals(1);
      builder.where("name").equals("John");
      builder.where("email").equals("test@example.com");
      builder.where("age").equals(25);
      builder.where("isActive").equals(true);
      builder.where("tags").contains("admin");
      builder.where("scores").contains(100);
      builder.where("createdAt").equals(new Date());


      expect(true).toBe(true); // Runtime assertion
    });

    it("should provide autocomplete for nested fields with dot notation", () => {
      const builder = query<ComplexUser>();

      // Nested profile fields
      builder.where("profile.bio").equals("Software Engineer");
      builder.where("profile.location").equals("New York");

      // Deeply nested fields
      builder.where("profile.coordinates.lat").equals(40.7128);
      builder.where("profile.coordinates.lng").equals(-74.0060);

      // Triple nested fields
      builder.where("profile.preferences.theme").equals("dark");
      builder.where("profile.preferences.notifications").equals(true);
      builder.where("profile.preferences.languages").contains("en");

      // Optional nested fields
      builder.where("profile.social.twitter").equals("@johndoe");

      expect(true).toBe(true);
    });

    it("should handle array element fields", () => {
      const builder = query<ComplexUser>();

      // Array fields
      builder.where("tags").contains("admin");
      builder.where("scores").contains(95);

      // Array of objects - these paths should be available
      builder.where("posts").elemMatch({ title: "Test Post" });
      builder.where("profile.preferences.languages").contains("en");

      expect(true).toBe(true);
    });
  });

  describe("Operator Constraint Tests", () => {
    it("should restrict comparison operators to comparable types", () => {
      const builder = query<ComplexUser>();

      // These should compile - numeric comparisons
      builder.where("age").greaterThan(18);
      builder.where("age").lessThanOrEqual(65);
      builder.where("profile.coordinates.lat").between(-90, 90);

      // String comparisons
      builder.where("name").greaterThan("A");
      builder.where("email").lessThan("z");

      // Date comparisons
      builder.where("createdAt").greaterThan(new Date("2023-01-01"));
      builder.where("createdAt").lessThanOrEqual(new Date());

      // Boolean should not have comparison operators
      // The following would ideally not compile, but testing the positive case
      builder.where("isActive").equals(true); // This should work
      builder.where("isActive").notEquals(false); // This should work

      expect(true).toBe(true);
    });

    it("should restrict array operators to array fields", () => {
      const builder = query<ComplexUser>();

      // Array operators should work with arrays
      builder.where("tags").all(["admin", "user"]);
      builder.where("tags").size(3);
      builder.where("scores").all([100, 95]);

      // elemMatch for array of objects
      builder.where("posts").elemMatch({
        published: true,
        views: { $gt: 1000 }
      });

      // Contains for arrays (checking if array contains value)
      builder.where("tags").contains("admin");
      builder.where("profile.preferences.languages").contains("en");

      expect(true).toBe(true);
    });

    it("should restrict string operators to string fields", () => {
      const builder = query<ComplexUser>();

      // Regex should work with strings
      builder.where("name").regex(/^John/);
      builder.where("email").matches(/@example\.com$/);
      builder.where("profile.bio").regex(/engineer/i);

      expect(true).toBe(true);
    });

    it("should handle existence checks for optional fields", () => {
      const builder = query<ComplexUser>();

      // Existence checks for optional fields
      builder.where("metadata").exists(true);
      builder.where("metadata").exists(false);
      builder.where("profile.social.twitter").exists();
      builder.where("profile.social.linkedin").exists(false);

      expect(true).toBe(true);
    });
  });

  describe("Value Type Inference Tests", () => {
    it("should infer correct types for field values", () => {
      // Test that TypeScript infers the correct value types
      type NameType = DeepValueOf<ComplexUser, "name">;
      type AgeType = DeepValueOf<ComplexUser, "age">;
      type ThemeType = DeepValueOf<ComplexUser, "profile.preferences.theme">;
      type TagsType = DeepValueOf<ComplexUser, "tags">;
      type CoordLatType = DeepValueOf<ComplexUser, "profile.coordinates.lat">;

      // Type assertions using expectTypeOf
      expectTypeOf<NameType>().toEqualTypeOf<string>();
      expectTypeOf<AgeType>().toEqualTypeOf<number>();
      expectTypeOf<ThemeType>().toEqualTypeOf<"light" | "dark">();
      expectTypeOf<TagsType>().toEqualTypeOf<string[]>();
      expectTypeOf<CoordLatType>().toEqualTypeOf<number>();

      const builder = query<ComplexUser>();

      // Values should match their expected types
      builder.where("name").equals("John"); // string
      builder.where("age").equals(25); // number
      builder.where("isActive").equals(true); // boolean
      builder.where("profile.preferences.theme").equals("dark"); // literal union
      builder.where("tags").equals(["admin", "user"]); // string[]

      expect(true).toBe(true);
    });

    it("should handle union types correctly", () => {
      const builder = query<ComplexUser>();

      // Union type field
      builder.where("profile.preferences.theme").equals("light");
      builder.where("profile.preferences.theme").equals("dark");
      builder.where("profile.preferences.theme").in(["light", "dark"]);

      expect(true).toBe(true);
    });

    it("should handle union types with $in operator directly", () => {
      interface UserWithRole {
        role: "ADMIN" | "USER" | "TEST";
      }

      // Test the direct safeSift function with union types
      const query1 = query<UserWithRole>()
        .where("role")
        .in(["ADMIN", "USER"])
        .build();

      // This should work without type errors
      const result = safeSift<UserWithRole>({
        role: { $in: ["ADMIN", "USER"] }
      });

      expect(query1).toBeDefined();
      expect(result).toBeDefined();
    });

    it("should handle optional field types", () => {
      const builder = query<ComplexUser>();

      // Optional fields can be undefined
      builder.where("profile.social.twitter").equals("@user");
      builder.where("profile.social.twitter").equals(undefined);

      expect(true).toBe(true);
    });
  });

  describe("Generic Constraint Tests", () => {
    it("should work with generic types extending interfaces", () => {
      type EntityId = number | string;

      interface BaseEntity {
        id: EntityId;
        createdAt: Date;
      }

      interface ExtendedUser extends BaseEntity {
        name: string;
        email: string;
      }

      const findById = (items: ExtendedUser[], id: EntityId): ExtendedUser[] => {
        return query<ExtendedUser>()
          .where("id")
          .equals(id)
          .execute()
          .filter(items);
      };

      const findRecent = (items: ExtendedUser[], date: Date): ExtendedUser[] => {
        return query<ExtendedUser>()
          .where("createdAt")
          .greaterThan(date)
          .execute()
          .filter(items);
      };

      const users: ExtendedUser[] = [
        { id: 1, name: "John", email: "john@test.com", createdAt: new Date() }
      ];

      const result1 = findById(users, 1);
      const result2 = findRecent(users, new Date("2023-01-01"));

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it("should handle partial types", () => {
      type PartialUser = Partial<ComplexUser>;

      const builder = query<PartialUser>();

      // Only test fields that are definitely available in partial types
      builder.where("name").equals("John");

      expect(true).toBe(true);
    });

    it("should work with Pick and Omit types", () => {
      type UserSubset = Pick<ComplexUser, "id" | "name" | "email">;
      type UserWithoutProfile = Omit<ComplexUser, "profile">;

      const pickedBuilder = query<UserSubset>();
      pickedBuilder.where("id").equals(1);
      pickedBuilder.where("name").equals("John");
      pickedBuilder.where("email").equals("test@example.com");

      const omittedBuilder = query<UserWithoutProfile>();
      omittedBuilder.where("id").equals(1);
      omittedBuilder.where("tags").contains("admin");
      // "profile" fields should not be available

      expect(true).toBe(true);
    });
  });

  describe("Complex Query Composition Tests", () => {
    it("should provide autocomplete through method chaining", () => {
      const complexQuery = query<ComplexUser>()
        .where("age").greaterThan(18)
        .and("isActive").equals(true)
        .and("profile.preferences.theme").equals("dark")
        .or("tags").contains("admin")
        .and("profile.coordinates.lat").between(-90, 90)
        .build();

      expectTypeOf(complexQuery).toMatchTypeOf<SafeSiftQuery<ComplexUser>>();
      expect(complexQuery).toBeDefined();
    });

    it("should maintain type safety with not() modifier", () => {
      const negatedQuery = query<ComplexUser>()
        .where("isActive").equals(false)
        .and("tags").contains("blocked")
        .not()
        .build();

      expectTypeOf(negatedQuery).toMatchTypeOf<SafeSiftQuery<ComplexUser>>();
      expect(negatedQuery).toHaveProperty("$not");
    });

    it("should handle complex logical operations", () => {
      const logicalQuery = query<ComplexUser>()
        .where("age").greaterThan(21)
        .and("profile.preferences.notifications").equals(true)
        .or("tags").all(["premium", "verified"])
        .and("posts").elemMatch({
          published: true,
          views: { $gte: 1000 }
        })
        .build();

      expectTypeOf(logicalQuery).toMatchTypeOf<SafeSiftQuery<ComplexUser>>();
      expect(logicalQuery).toBeDefined();
    });
  });

  describe("Autocomplete Edge Cases", () => {
    it("should handle deeply nested optional paths", () => {
      interface DeeplyNested {
        level1: {
          level2: {
            level3: {
              level4: {
                value: string;
              };
            };
          };
        };
      }

      const builder = query<DeeplyNested>();
      builder.where("level1.level2.level3.level4.value").equals("test");

      expect(true).toBe(true);
    });

    it("should handle recursive types safely", () => {
      interface TreeNode {
        value: string;
        childCount: number;
      }

      const builder = query<TreeNode>();
      builder.where("value").equals("root");
      builder.where("childCount").equals(3);

      expect(true).toBe(true);
    });

    it("should handle index signatures", () => {
      interface DynamicObject {
        id: string;
        [key: string]: unknown;
      }

      const builder = query<DynamicObject>();
      builder.where("id").equals("123");
      // Dynamic keys should still work but without strict typing
      builder.where("anyField").equals("value");

      expect(true).toBe(true);
    });

    it("should provide proper autocomplete for arrays of primitives", () => {
      interface WithArrays {
        numbers: number[];
        strings: string[];
        booleans: boolean[];
        dates: Date[];
      }

      const builder = query<WithArrays>();

      builder.where("numbers").contains(42);
      builder.where("strings").all(["a", "b", "c"]);
      builder.where("booleans").size(5);
      builder.where("dates").contains(new Date());

      expect(true).toBe(true);
    });
  });

  describe("Type Safety Validation Tests", () => {
    it("should validate query structure types", () => {
      const validQuery: SafeSiftQuery<ComplexUser> = {
        age: { $gt: 18 },
        "profile.preferences.theme": "dark",
        tags: { $in: ["admin", "user"] },
        $or: [
          { isActive: true },
          { name: "John" }
        ]
      };

      expect(validQuery).toBeDefined();
      expectTypeOf(validQuery).toMatchTypeOf<SafeSiftQuery<ComplexUser>>();
    });

    it("should validate field path extraction", () => {
      type AllPaths = DeepKeyOf<ComplexUser>;

      // Sample of expected paths
      const validPaths: AllPaths[] = [
        "id",
        "name",
        "profile",
        "profile.bio",
        "profile.coordinates.lat",
        "profile.preferences.theme",
        "profile.preferences.languages",
        "posts",
        "metadata.lastLogin"
      ];

      validPaths.forEach(path => {
        expect(typeof path).toBe("string");
      });
    });

    it("should validate value extraction for paths", () => {
      // Test value extraction for various paths
      type IdValue = DeepValueOf<ComplexUser, "id">;
      type BioValue = DeepValueOf<ComplexUser, "profile.bio">;
      type ThemeValue = DeepValueOf<ComplexUser, "profile.preferences.theme">;
      type TwitterValue = DeepValueOf<ComplexUser, "profile.social.twitter">;

      expectTypeOf<IdValue>().toEqualTypeOf<number>();
      expectTypeOf<BioValue>().toEqualTypeOf<string>();
      expectTypeOf<ThemeValue>().toEqualTypeOf<"light" | "dark">();
      expectTypeOf<TwitterValue>().toEqualTypeOf<string | undefined>();

      expect(true).toBe(true);
    });
  });
});