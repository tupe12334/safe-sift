/**
 * @fileoverview Query Builder Examples - Comprehensive demonstrations of SafeSift's query builder capabilities.
 * 
 * This file contains practical examples showing how to use SafeSift's fluent query builder API
 * for various common querying scenarios. Examples range from basic operations to advanced
 * type-safe querying with nested objects and complex logical conditions.
 * 
 * @example
 * ```typescript
 * import { 
 *   basicBuilderExamples, 
 *   nestedBuilderExamples, 
 *   logicalBuilderExamples,
 *   advancedBuilderExamples,
 *   fluentApiDemonstration,
 *   typeSafetyDemonstration 
 * } from './builder-examples';
 * 
 * // Run all examples
 * basicBuilderExamples();
 * nestedBuilderExamples();
 * logicalBuilderExamples();
 * advancedBuilderExamples();
 * fluentApiDemonstration();
 * typeSafetyDemonstration();
 * ```
 */

import { query } from '../src/index';

/**
 * Example user interface demonstrating complex nested object structures
 * with various field types including primitives, arrays, and nested objects.
 * This structure is used throughout the examples to showcase SafeSift's capabilities.
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
 * Sample dataset used for demonstrating query builder functionality.
 * Contains diverse user profiles with various combinations of properties
 * to showcase different query scenarios and edge cases.
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
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 35,
    isActive: true,
    tags: ['developer'],
    profile: {
      bio: 'Backend developer',
      location: 'Austin',
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    },
    createdAt: new Date('2022-12-10'),
  },
];

/**
 * Demonstrates basic query builder operations including equality checks,
 * comparisons, string pattern matching, array operations, and range queries.
 * 
 * This function showcases the fundamental building blocks of query construction
 * using SafeSift's fluent API with simple, single-condition queries.
 * 
 * @example
 * ```typescript
 * // Run basic examples
 * basicBuilderExamples();
 * 
 * // Expected output:
 * // Active users: 2
 * // Adult users: 3
 * // Users named John: 1
 * // Developers: 2
 * // Young adults (20-35): 3
 * ```
 */
export function basicBuilderExamples(): void {
  console.log('=== Basic Builder Examples ===');

  // Simple equality - fluent style
  const activeUsers = query<User>()
    .where('isActive').equals(true)
    .execute()
    .filter(users);
  console.log('Active users:', activeUsers.length);

  // Comparison operations
  const adults = query<User>()
    .where('age').greaterThanOrEqual(18)
    .execute()
    .filter(users);
  console.log('Adult users:', adults.length);

  // String pattern matching
  const johnUsers = query<User>()
    .where('name').regex(/john/i)
    .execute()
    .filter(users);
  console.log('Users named John:', johnUsers.length);

  // Array operations
  const developers = query<User>()
    .where('tags').contains('developer')
    .execute()
    .filter(users);
  console.log('Developers:', developers.length);

  // Range queries
  const youngAdults = query<User>()
    .where('age').between(20, 35)
    .execute()
    .filter(users);
  console.log('Young adults (20-35):', youngAdults.length);
}

/**
 * Demonstrates querying nested object properties using dot notation.
 * Shows how SafeSift maintains type safety even with deeply nested structures
 * and provides IntelliSense support for nested field access.
 * 
 * Features demonstrated:
 * - Nested property access with dot notation
 * - Type-safe deep property querying
 * - Combining nested field conditions with logical operators
 * 
 * @example
 * ```typescript
 * // Run nested field examples
 * nestedBuilderExamples();
 * 
 * // Expected output:
 * // New York users: 1
 * // Dark theme users: 2
 * // Notification enabled users (not in Austin): 1
 * ```
 */
export function nestedBuilderExamples(): void {
  console.log('=== Nested Field Builder Examples ===');

  // Nested property access
  const newYorkers = query<User>()
    .where('profile.location').equals('New York')
    .execute()
    .filter(users);
  console.log('New York users:', newYorkers.length);

  // Deep nested properties with type safety
  const darkThemeUsers = query<User>()
    .where('profile.preferences.theme').equals('dark')
    .execute()
    .filter(users);
  console.log('Dark theme users:', darkThemeUsers.length);

  // Complex nested queries
  const notificationEnabledUsers = query<User>()
    .where('profile.preferences.notifications').equals(true)
    .and('profile.location').notEquals('Austin')
    .execute()
    .filter(users);
  console.log('Notification enabled users (not in Austin):', notificationEnabledUsers.length);
}

/**
 * Demonstrates logical operations for combining multiple query conditions.
 * Shows how to use AND, OR, and NOT operations to create complex query logic
 * while maintaining readability through the fluent API.
 * 
 * Features demonstrated:
 * - AND operations with method chaining
 * - OR operations for alternative conditions
 * - Complex logical combinations
 * - NOT operations for negating entire queries
 * 
 * @example
 * ```typescript
 * // Run logical operation examples
 * logicalBuilderExamples();
 * 
 * // Expected output:
 * // Active adults: 2
 * // Admins or managers: 2
 * // Complex query results: 3
 * // Inactive users: 1
 * ```
 */
export function logicalBuilderExamples(): void {
  console.log('=== Logical Operation Builder Examples ===');

  // AND operations - method chaining style
  const activeAdults = query<User>()
    .where('isActive').equals(true)
    .and('age').greaterThanOrEqual(25)
    .execute()
    .filter(users);
  console.log('Active adults:', activeAdults.length);

  // OR operations
  const adminOrManager = query<User>()
    .where('tags').contains('admin')
    .or('tags').contains('manager')
    .execute()
    .filter(users);
  console.log('Admins or managers:', adminOrManager.length);

  // Complex logical combinations
  const complexQuery = query<User>()
    .where('age').greaterThanOrEqual(25)
    .and('isActive').equals(true)
    .or('tags').contains('manager')
    .execute()
    .filter(users);
  console.log('Complex query results:', complexQuery.length);

  // NOT operations
  const inactiveUsers = query<User>()
    .where('isActive').equals(true)
    .not()
    .execute()
    .filter(users);
  console.log('Inactive users:', inactiveUsers.length);
}

/**
 * Demonstrates advanced query builder features including array operations,
 * date range queries, regex pattern matching, and complex array conditions.
 * 
 * Features demonstrated:
 * - Multi-condition array queries
 * - Date range filtering with Date objects
 * - Email domain validation with regex
 * - Array size and content validation
 * - Combining multiple advanced conditions
 * 
 * @example
 * ```typescript
 * // Run advanced examples
 * advancedBuilderExamples();
 * 
 * // Expected output:
 * // Experienced dark-theme developers: 2
 * // Users created in 2023: 2
 * // Users with @example.com email: 3
 * // Users with exactly admin and developer tags: 1
 * ```
 */
export function advancedBuilderExamples(): void {
  console.log('=== Advanced Builder Examples ===');

  // Array operations with multiple conditions
  const experiencedDevelopers = query<User>()
    .where('tags').contains('developer')
    .and('age').greaterThan(28)
    .and('profile.preferences.theme').equals('dark')
    .execute()
    .filter(users);
  console.log('Experienced dark-theme developers:', experiencedDevelopers.length);

  // Date range queries
  const recentUsers = query<User>()
    .where('createdAt').greaterThan(new Date('2023-01-01'))
    .and('createdAt').lessThan(new Date('2024-01-01'))
    .execute()
    .filter(users);
  console.log('Users created in 2023:', recentUsers.length);

  // Email domain validation
  const exampleDomainUsers = query<User>()
    .where('email').regex(/@example\.com$/)
    .execute()
    .filter(users);
  console.log('Users with @example.com email:', exampleDomainUsers.length);

  // Multiple array conditions
  const multiTagUsers = query<User>()
    .where('tags').size(2)
    .and('tags').all(['admin', 'developer'])
    .execute()
    .filter(users);
  console.log('Users with exactly admin and developer tags:', multiTagUsers.length);
}

/**
 * Demonstrates the full power of SafeSift's fluent API with sophisticated queries
 * and different usage patterns. Shows how complex business logic can be expressed
 * in readable, chainable method calls.
 * 
 * Features demonstrated:
 * - Complex multi-condition queries with business logic
 * - Different execution patterns (immediate, build, reuse)
 * - Method chaining for readability
 * - Query object inspection
 * - SafeSift instance reuse
 * 
 * @example
 * ```typescript
 * // Run fluent API demonstration
 * fluentApiDemonstration();
 * 
 * // Expected output:
 * // Sophisticated query results: 2
 * // Immediate execution count: 2
 * // Built query object: { "age": { "$gt": 30 } }
 * // Find first developer: John Doe
 * // Count developers: 2
 * // Test if John is developer: true
 * ```
 */
export function fluentApiDemonstration(): void {
  console.log('=== Fluent API Demonstration ===');

  // Showcase the fluent, readable style
  const sophisticatedQuery = query<User>()
    .where('age').between(25, 40)                    // Age range
    .and('isActive').equals(true)                    // Must be active
    .and('tags').contains('developer')               // Must be a developer
    .and('profile.location').in(['New York', 'San Francisco', 'Austin']) // In major cities
    .and('profile.preferences.notifications').equals(true)  // Notifications enabled
    .and('createdAt').greaterThan(new Date('2022-01-01'))   // Recent users
    .execute();

  const results = sophisticatedQuery.filter(users);
  console.log('Sophisticated query results:', results.length);

  // Show different ways to use the builder
  console.log('\n=== Different Usage Patterns ===');

  // 1. Build and execute immediately
  const immediate = query<User>()
    .where('isActive').equals(true)
    .execute()
    .count(users);
  console.log('Immediate execution count:', immediate);

  // 2. Build query object for later use
  const builtQuery = query<User>()
    .where('age').greaterThan(30)
    .build();
  console.log('Built query object:', JSON.stringify(builtQuery, null, 2));

  // 3. Reuse SafeSift instance
  const reusableQuery = query<User>()
    .where('tags').contains('developer')
    .execute();
  
  console.log('Find first developer:', reusableQuery.find(users)?.name);
  console.log('Count developers:', reusableQuery.count(users));
  console.log('Test if John is developer:', reusableQuery.test(users[0]!));
}

/**
 * Demonstrates the type safety benefits of SafeSift's query builder.
 * Shows how TypeScript provides compile-time checking, IntelliSense support,
 * and prevents common querying errors through strong typing.
 * 
 * Features demonstrated:
 * - Field name autocompletion and validation
 * - Nested field path type checking
 * - Type-specific operation constraints
 * - Compile-time error prevention
 * - IntelliSense support for complex nested structures
 * 
 * @remarks
 * This function showcases queries that would provide full IntelliSense support
 * in a TypeScript IDE, including:
 * - Autocomplete for field names
 * - Type-appropriate method suggestions
 * - Compile-time errors for invalid field paths or operations
 * 
 * @example
 * ```typescript
 * // Run type safety demonstration
 * typeSafetyDemonstration();
 * 
 * // Expected output:
 * // Type-safe query 1 results: 1
 * // Type-safe query 2 results: 0
 * // Type-safe query 3 results: 3
 * // ... (results for all 8 queries)
 * ```
 */
export function typeSafetyDemonstration(): void {
  console.log('=== Type Safety Demonstration ===');

  // All these queries are fully type-safe with IntelliSense support
  const typeSafeQueries = [
    // Field name autocompletion
    query<User>().where('id').equals(1),
    query<User>().where('name').regex(/pattern/),
    query<User>().where('age').between(18, 65),
    
    // Nested field autocompletion
    query<User>().where('profile.bio').exists(),
    query<User>().where('profile.preferences.theme').equals('dark'),
    
    // Type-specific operations
    query<User>().where('tags').contains('admin'),        // String in string array
    query<User>().where('tags').size(2),                  // Array size
    query<User>().where('createdAt').greaterThan(new Date()), // Date comparison
  ];

  typeSafeQueries.forEach((queryBuilder, index) => {
    const result = queryBuilder.execute().count(users);
    console.log(`Type-safe query ${index + 1} results:`, result);
  });
}