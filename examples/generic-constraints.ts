/**
 * @fileoverview Generic Type Constraints Examples - Demonstrations using SafeSift with generic functions and type constraints.
 *
 * This file showcases how SafeSift works seamlessly with TypeScript's generic type system,
 * particularly when using type constraints in generic functions. These patterns are common
 * in utility functions, data processing pipelines, and reusable filtering logic.
 *
 * Key features demonstrated:
 * - Generic functions with type constraints (T extends BaseType)
 * - Type-safe field access through constraints
 * - Reusable filtering functions that work with multiple types
 * - Real-world use cases in data processing
 *
 * @example
 * ```typescript
 * import {
 *   basicGenericConstraint,
 *   advancedGenericFiltering,
 *   realWorldExamples
 * } from './generic-constraints';
 *
 * // Run all examples
 * basicGenericConstraint();
 * advancedGenericFiltering();
 * realWorldExamples();
 * ```
 */

import { query } from "../src/index";

/**
 * Base type with common identification field
 */
type Identifiable = {
  id: string;
};

/**
 * Base type for entities with a type discriminator
 */
type TypedEntity = {
  type: string;
};

/**
 * Base type for entities with status
 */
type StatusEntity = {
  status: "active" | "inactive" | "pending";
};

/**
 * Sample data types that extend base constraints
 */
interface User extends Identifiable, TypedEntity, StatusEntity {
  id: string;
  type: "user";
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  department?: string;
}

interface Product extends Identifiable, TypedEntity {
  id: string;
  type: "product";
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface Order extends Identifiable, StatusEntity {
  id: string;
  customerId: string;
  amount: number;
  status: "active" | "inactive" | "pending";
  orderDate: Date;
}

/**
 * Sample datasets for demonstration
 */
const users: User[] = [
  {
    id: "1",
    type: "user",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    department: "engineering",
  },
  {
    id: "2",
    type: "user",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "inactive",
  },
  {
    id: "3",
    type: "user",
    name: "Bob Wilson",
    email: "bob@example.com",
    status: "pending",
    department: "design",
  },
];

const products: Product[] = [
  {
    id: "p1",
    type: "product",
    name: "Laptop",
    price: 1000,
    category: "electronics",
    inStock: true,
  },
  {
    id: "p2",
    type: "product",
    name: "Book",
    price: 15,
    category: "education",
    inStock: false,
  },
  {
    id: "p3",
    type: "product",
    name: "Phone",
    price: 800,
    category: "electronics",
    inStock: true,
  },
];

const orders: Order[] = [
  {
    id: "o1",
    customerId: "1",
    amount: 1000,
    status: "active",
    orderDate: new Date("2023-01-15"),
  },
  {
    id: "o2",
    customerId: "2",
    amount: 15,
    status: "inactive",
    orderDate: new Date("2023-02-20"),
  },
  {
    id: "o3",
    customerId: "1",
    amount: 800,
    status: "pending",
    orderDate: new Date("2023-03-10"),
  },
];

/**
 * Demonstrates basic generic constraint usage with SafeSift.
 * Shows how to create reusable filtering functions that work with any type
 * extending a base constraint.
 *
 * Features demonstrated:
 * - Generic functions with simple type constraints
 * - Field access through constraint properties
 * - Type safety preservation across generic boundaries
 *
 * @example
 * ```typescript
 * basicGenericConstraint();
 *
 * // Expected output:
 * // Filtered users by type 'user': 3
 * // Filtered products by type 'product': 3
 * // Active status entities (users): 1
 * // Active status entities (orders): 1
 * ```
 */
export function basicGenericConstraint(): void {
  console.log("=== Basic Generic Constraint Examples ===");

  // Generic function that filters entities by type
  const filterByType = <T extends TypedEntity>(
    array: T[],
    type: T["type"]
  ): T[] => {
    return query<T>().where("type").equals(type as any).execute().filter(array);
  };

  // Generic function that filters entities by status
  const filterByStatus = <T extends StatusEntity>(
    array: T[],
    status: T["status"]
  ): T[] => {
    return query<T>().where("status").equals(status as any).execute().filter(array);
  };

  // Usage with different types
  const filteredUsers = filterByType(users, "user");
  const filteredProducts = filterByType(products, "product");

  console.log(`Filtered users by type 'user': ${filteredUsers.length}`);
  console.log(
    `Filtered products by type 'product': ${filteredProducts.length}`
  );

  // Usage with status constraint
  const activeUsers = filterByStatus(users, "active");
  const activeOrders = filterByStatus(orders, "active");

  console.log(`Active status entities (users): ${activeUsers.length}`);
  console.log(`Active status entities (orders): ${activeOrders.length}`);
}

/**
 * Demonstrates advanced generic filtering with multiple constraints and complex queries.
 * Shows how to build sophisticated reusable query functions that preserve type safety.
 *
 * Features demonstrated:
 * - Multiple generic type constraints
 * - Complex query building with generic types
 * - Reusable query combinators
 * - Type intersection usage
 *
 * @example
 * ```typescript
 * advancedGenericFiltering();
 *
 * // Expected output:
 * // Active identifiable entities: 2
 * // Filtered by ID and status: 1
 * // Users with departments: 2
 * // Electronics products in stock: 2
 * ```
 */
export function advancedGenericFiltering(): void {
  console.log("=== Advanced Generic Filtering Examples ===");

  // Generic function with multiple constraints
  const findActiveById = <T extends Identifiable & StatusEntity>(
    array: T[],
    id: string
  ): T[] => {
    return query<T>()
      .where("id")
      .equals(id as any)
      .and("status")
      .equals("active" as any)
      .execute()
      .filter(array);
  };

  // Generic function with optional fields
  const hasOptionalField = <T extends Record<string, any>>(
    array: T[],
    field: keyof T
  ): T[] => {
    return query<T>().where(field as any).exists(true).execute().filter(array);
  };

  // Usage with different entity types
  const allActiveEntities = [
    ...query<User>().where("status").equals("active").execute().filter(users),
    ...query<Order>().where("status").equals("active").execute().filter(orders),
  ];
  console.log(`Active identifiable entities: ${allActiveEntities.length}`);

  // Find specific active user
  const activeUserById = findActiveById(users, "1");
  console.log(`Filtered by ID and status: ${activeUserById.length}`);

  // Find users with departments (optional field)
  const usersWithDepartment = hasOptionalField(users, "department");
  console.log(`Users with departments: ${usersWithDepartment.length}`);

  // Complex product filtering
  const electronicsInStock = query<Product>()
    .where("category")
    .equals("electronics")
    .and("inStock")
    .equals(true)
    .execute()
    .filter(products);
  console.log(`Electronics products in stock: ${electronicsInStock.length}`);
}

/**
 * Real-world data processing pipeline examples using generic constraints.
 * Demonstrates practical applications of SafeSift in data transformation,
 * filtering, and business logic scenarios.
 *
 * Features demonstrated:
 * - Data processing pipelines with generic functions
 * - Business logic implementation with type safety
 * - Reusable utility functions for common operations
 * - Complex filtering chains with multiple steps
 *
 * @example
 * ```typescript
 * realWorldExamples();
 *
 * // Expected output:
 * // Active users in engineering: 1
 * // High-value orders: 2
 * // Available products under $500: 1
 * // Recent orders by active users: 1
 * ```
 */
export function realWorldExamples(): void {
  console.log("=== Real-World Generic Examples ===");

  // Data pipeline: Filter and transform data
  const getActiveUsersByDepartment = <T extends User>(
    users: T[],
    department: string
  ): T[] => {
    return query<T>()
      .where("status")
      .equals("active" as any)
      .and("department")
      .equals(department as any)
      .execute()
      .filter(users);
  };

  // Business logic: High-value order processing
  const getHighValueOrders = <T extends { amount: number }>(
    orders: T[],
    minAmount: number = 500
  ): T[] => {
    return query<T>()
      .where("amount")
      .greaterThanOrEqual(minAmount as any)
      .execute()
      .filter(orders);
  };

  // Inventory management: Available products under budget
  const getAvailableProductsUnderBudget = <T extends Product>(
    products: T[],
    maxPrice: number
  ): T[] => {
    return query<T>()
      .where("inStock")
      .equals(true as any)
      .and("price")
      .lessThan(maxPrice as any)
      .execute()
      .filter(products);
  };

  // Complex data joining simulation
  const getRecentOrdersByActiveUsers = () => {
    const activeUserIds = query<User>()
      .where("status")
      .equals("active")
      .execute()
      .filter(users)
      .map((u) => u.id);

    return query<Order>()
      .where("customerId")
      .in(activeUserIds)
      .and("orderDate")
      .greaterThan(new Date("2023-01-01"))
      .execute()
      .filter(orders);
  };

  // Execute examples
  const engineeringUsers = getActiveUsersByDepartment(users, "engineering");
  console.log(`Active users in engineering: ${engineeringUsers.length}`);

  const highValueOrders = getHighValueOrders(orders);
  console.log(`High-value orders: ${highValueOrders.length}`);

  const budgetProducts = getAvailableProductsUnderBudget(products, 500);
  console.log(`Available products under $500: ${budgetProducts.length}`);

  const recentOrders = getRecentOrdersByActiveUsers();
  console.log(`Recent orders by active users: ${recentOrders.length}`);
}

/**
 * Utility function demonstrating the exact use case from the bug report.
 * This is the pattern that was failing before the DeepKeyOf fix.
 *
 * @example
 * ```typescript
 * // This now works correctly with the fix:
 * const result = filterByType(['item1', 'item2'], 'test');
 * ```
 */
export function demonstrateOriginalIssue(): void {
  console.log("=== Original Issue Demonstration ===");

  // The exact pattern that was causing the TypeScript error
  type A = { type: string };

  const func = <T extends A>(array: T[]): T[] => {
    // This line was failing before the fix:
    // "Argument of type '"type"' is not assignable to parameter of type 'DeepKeyOf<T>'"
    return query<T>().where("type").equals("test" as any).execute().filter(array);
  };

  // Test data
  interface TestItem extends A {
    type: string;
    name: string;
    value: number;
  }

  const testData: TestItem[] = [
    { type: "test", name: "item1", value: 10 },
    { type: "other", name: "item2", value: 20 },
    { type: "test", name: "item3", value: 30 },
  ];

  const result = func(testData);
  console.log(`Items with type 'test': ${result.length}`);
  console.log(`Item names: ${result.map((item) => item.name).join(", ")}`);
}

// Auto-run examples if this file is executed directly
if (require.main === module) {
  basicGenericConstraint();
  console.log("");
  advancedGenericFiltering();
  console.log("");
  realWorldExamples();
  console.log("");
  demonstrateOriginalIssue();
}
