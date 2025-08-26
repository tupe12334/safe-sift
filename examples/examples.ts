/**
 * @fileoverview SafeSift Direct API Examples - Demonstrations using direct SafeSift class instantiation.
 * 
 * This file contains practical examples showing how to use SafeSift's direct API
 * (as opposed to the fluent query builder). Examples demonstrate various ways to
 * create queries using object literals and MongoDB-style syntax.
 * 
 * Key differences from builder-examples.ts:
 * - Direct SafeSift class instantiation
 * - Object literal query syntax
 * - Factory function usage (createQuery, safeSift)
 * - Raw MongoDB-style query objects
 * 
 * @example
 * ```typescript
 * import { 
 *   basicExamples, 
 *   nestedExamples, 
 *   logicalExamples,
 *   arrayMethodExamples,
 *   typeSafetyExamples,
 *   advancedExamples 
 * } from './examples';
 * 
 * // Run all examples
 * basicExamples();
 * nestedExamples();
 * logicalExamples();
 * arrayMethodExamples();
 * typeSafetyExamples();
 * advancedExamples();
 * ```
 */

import { SafeSift, safeSift, createQuery } from './index';

/**
 * User interface for demonstrating SafeSift functionality.
 * Identical structure to builder-examples.ts for consistency.
 */
interface User {
  /** Unique identifier for the user */
  id: number;
  /** Full name of the user */
  name: string;
  /** Email address */
  email: string;
  /** Age in years */
  age: number;
  /** Whether the user account is active */
  isActive: boolean;
  /** Array of role/permission tags */
  tags: string[];
  /** Nested profile information */
  profile: {
    /** User biography */
    bio: string;
    /** User location/city */
    location: string;
    /** User preferences object */
    preferences: {
      /** UI theme preference */
      theme: 'light' | 'dark';
      /** Whether notifications are enabled */
      notifications: boolean;
    };
  };
  /** Account creation date */
  createdAt: Date;
}

/**
 * Sample user dataset for demonstrating direct SafeSift API functionality.
 * Contains two users with different characteristics to showcase various query scenarios.
 */
const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    tags: ['admin', 'developer'],
    profile: {
      bio: 'Software engineer',
      location: 'New York',
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    },
    createdAt: new Date('2023-01-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    isActive: false,
    tags: ['designer', 'manager'],
    profile: {
      bio: 'UX Designer',
      location: 'San Francisco',
      preferences: {
        theme: 'light',
        notifications: false,
      },
    },
    createdAt: new Date('2023-02-20'),
  },
];

/**
 * Demonstrates basic SafeSift usage with direct class instantiation and factory functions.
 * Shows fundamental query patterns using object literal syntax instead of fluent API.
 * 
 * Features demonstrated:
 * - Direct SafeSift class instantiation
 * - Factory function usage (createQuery, safeSift)
 * - Simple equality queries
 * - Comparison operators with MongoDB-style syntax
 * - String pattern matching with $regex
 * - Array element matching
 * 
 * @example
 * ```typescript
 * // Run basic examples
 * basicExamples();
 * 
 * // Expected output:
 * // Active users: 1
 * // Adult users: 2
 * // Users named John: [{ name: 'John Doe', ... }]
 * // Developers: 1
 * ```
 */
export function basicExamples(): void {
  console.log('=== Basic Examples ===');

  // Simple equality
  const activeUsers = new SafeSift<User>({ isActive: true }).filter(users);
  console.log('Active users:', activeUsers.length);

  // Comparison operators
  const adultsQuery = createQuery<User>({ age: { $gte: 18 } });
  const adults = adultsQuery.filter(users);
  console.log('Adult users:', adults.length);

  // String operations
  const johnUsers = safeSift<User>({ name: { $regex: /john/i } });
  console.log('Users named John:', johnUsers.filter(users));

  // Array operations
  const developers = new SafeSift<User>({ tags: 'developer' }).filter(users);
  console.log('Developers:', developers.length);
}

/**
 * Demonstrates querying nested object properties using dot notation in query objects.
 * Shows how SafeSift handles deep property access with type safety.
 * 
 * Features demonstrated:
 * - Nested property access with string keys
 * - Deep nested property querying
 * - Type-safe property path validation
 * 
 * @example
 * ```typescript
 * // Run nested examples
 * nestedExamples();
 * 
 * // Expected output:
 * // New York users: 1
 * // Dark theme users: 1
 * ```
 */
export function nestedExamples(): void {
  console.log('=== Nested Object Examples ===');

  // Nested property access
  const newYorkers = new SafeSift<User>({ 'profile.location': 'New York' }).filter(users);
  console.log('New York users:', newYorkers.length);

  // Deep nested properties
  const darkThemeUsers = new SafeSift<User>({ 
    'profile.preferences.theme': 'dark' 
  }).filter(users);
  console.log('Dark theme users:', darkThemeUsers.length);
}

/**
 * Demonstrates logical operators using MongoDB-style query syntax.
 * Shows how to combine multiple conditions with $and, $or, and nested logic.
 * 
 * Features demonstrated:
 * - $and operator for required conditions
 * - $or operator for alternative conditions
 * - Complex nested logical combinations
 * - Mixed field and logical operator usage
 * 
 * @example
 * ```typescript
 * // Run logical examples
 * logicalExamples();
 * 
 * // Expected output:
 * // Active adults: 1
 * // Admins or managers: 2
 * // Complex query results: 2
 * ```
 */
export function logicalExamples(): void {
  console.log('=== Logical Operator Examples ===');

  // AND operation
  const activeAdults = new SafeSift<User>({
    $and: [
      { isActive: true },
      { age: { $gte: 25 } }
    ]
  }).filter(users);
  console.log('Active adults:', activeAdults.length);

  // OR operation
  const adminOrManager = new SafeSift<User>({
    $or: [
      { tags: 'admin' },
      { tags: 'manager' }
    ]
  }).filter(users);
  console.log('Admins or managers:', adminOrManager.length);

  // Complex nested logic
  const complexQuery = new SafeSift<User>({
    $and: [
      { age: { $gte: 20 } },
      {
        $or: [
          { isActive: true },
          { 'profile.preferences.notifications': true }
        ]
      }
    ]
  });
  console.log('Complex query results:', complexQuery.count(users));
}

/**
 * Demonstrates all SafeSift array and object testing methods.
 * Shows the various ways to use a SafeSift instance to query and test data.
 * 
 * Features demonstrated:
 * - Single object testing with test()
 * - Array searching with find() and findIndex()
 * - Boolean array testing with some() and every()
 * - Counting matching items with count()
 * - SafeSift instance reuse
 * 
 * @example
 * ```typescript
 * // Run array method examples
 * arrayMethodExamples();
 * 
 * // Expected output:
 * // First user is active: true
 * // First active user: John Doe
 * // Index of first active user: 0
 * // Some users are active: true
 * // All users are active: false
 * // Number of active users: 1
 * ```
 */
export function arrayMethodExamples(): void {
  console.log('=== Array Method Examples ===');

  const query = new SafeSift<User>({ isActive: true });

  // Test single object
  console.log('First user is active:', query.test(users[0]!));

  // Find operations
  console.log('First active user:', query.find(users)?.name);
  console.log('Index of first active user:', query.findIndex(users));

  // Boolean operations
  console.log('Some users are active:', query.some(users));
  console.log('All users are active:', query.every(users));

  // Count
  console.log('Number of active users:', query.count(users));
}

/**
 * Demonstrates the type safety benefits of SafeSift's query system.
 * Shows how TypeScript ensures query correctness and provides IntelliSense support.
 * 
 * Features demonstrated:
 * - Type-safe field name validation
 * - Type-appropriate operator constraints
 * - Nested field path type checking
 * - Compile-time error prevention
 * - Various data type specific operations
 * 
 * @remarks
 * All queries in this function are fully type-checked by TypeScript,
 * preventing common errors like:
 * - Invalid field names
 * - Type-incompatible operators
 * - Incorrect nested property paths
 * 
 * @example
 * ```typescript
 * // Run type safety examples
 * typeSafetyExamples();
 * 
 * // Expected output:
 * // Query 1 results: 1
 * // Query 2 results: 0
 * // Query 3 results: 2
 * // Query 4 results: 1
 * // Query 5 results: 2
 * // Query 6 results: 2
 * ```
 */
export function typeSafetyExamples(): void {
  console.log('=== Type Safety Examples ===');

  // These queries are type-safe and will provide autocompletion
  const validQueries = [
    new SafeSift<User>({ id: 1 }),                                    // number equality
    new SafeSift<User>({ name: { $regex: /pattern/ } }),              // string regex
    new SafeSift<User>({ age: { $gte: 18, $lte: 65 } }),             // number comparisons
    new SafeSift<User>({ tags: { $size: 2 } }),                      // array size
    new SafeSift<User>({ 'profile.bio': { $exists: true } }),        // nested existence
    new SafeSift<User>({ createdAt: { $gt: new Date('2023-01-01') } }) // date comparison
  ];

  validQueries.forEach((query, index) => {
    console.log(`Query ${index + 1} results:`, query.count(users));
  });
}

/**
 * Order interface demonstrating complex nested structures with arrays of objects.
 * Used to showcase advanced SafeSift capabilities with real-world data structures.
 */
interface Order {
  /** Unique order identifier */
  id: string;
  /** ID of the customer who placed the order */
  customerId: number;
  /** Array of items in the order */
  items: {
    /** Item name */
    name: string;
    /** Item price in dollars */
    price: number;
    /** Product category */
    category: string;
    /** Array of item tags */
    tags: string[];
  }[];
  /** Total order amount */
  total: number;
  /** Current order status */
  status: 'pending' | 'completed' | 'cancelled';
  /** Additional order metadata */
  metadata: {
    /** Source platform (web, mobile, etc.) */
    source: string;
    /** Optional discount amount */
    discount?: number;
  };
}

/**
 * Demonstrates advanced SafeSift features with complex nested data structures.
 * Shows array element matching, complex logical queries, and real-world scenarios.
 * 
 * Features demonstrated:\n * - $elemMatch for querying array elements
 * - Complex nested object queries
 * - Optional property existence checking
 * - Multiple condition combinations
 * - Real-world e-commerce query scenarios
 * 
 * @example\n * ```typescript
 * // Run advanced examples
 * advancedExamples();
 * 
 * // Expected output:
 * // Orders with expensive electronics: 1
 * // Web orders with discount > $100: 1
 * // Orders containing computer items: 1
 * ```
 */
export function advancedExamples(): void {
  /** Sample order data showcasing complex nested structures */
  const orders: Order[] = [
    {
      id: 'ord-1',
      customerId: 1,
      items: [
        { name: 'Laptop', price: 1000, category: 'electronics', tags: ['computer', 'work'] },
        { name: 'Mouse', price: 25, category: 'electronics', tags: ['computer', 'accessory'] }
      ],
      total: 1025,
      status: 'completed',
      metadata: { source: 'web', discount: 50 }
    },
    {
      id: 'ord-2',
      customerId: 2,
      items: [
        { name: 'Book', price: 15, category: 'books', tags: ['education', 'fiction'] }
      ],
      total: 15,
      status: 'pending',
      metadata: { source: 'mobile' }
    }
  ];

  console.log('=== Advanced Examples ===');

  // Array element matching with $elemMatch
  const expensiveElectronics = new SafeSift<Order>({
    items: { 
      $elemMatch: { 
        category: 'electronics', 
        price: { $gt: 500 } 
      } 
    }
  }).filter(orders);
  console.log('Orders with expensive electronics:', expensiveElectronics.length);

  // Complex nested queries
  const webOrdersWithDiscount = new SafeSift<Order>({
    $and: [
      { 'metadata.source': 'web' },
      { 'metadata.discount': { $exists: true } },
      { total: { $gt: 100 } }
    ]
  }).filter(orders);
  console.log('Web orders with discount > $100:', webOrdersWithDiscount.length);

  // Multiple array conditions
  const computerOrders = new SafeSift<Order>({
    items: { 
      $elemMatch: { 
        tags: { $in: ['computer'] } 
      } 
    }
  }).filter(orders);
  console.log('Orders containing computer items:', computerOrders.length);
}