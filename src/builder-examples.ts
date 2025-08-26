import { query } from './index';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  tags: string[];
  profile: {
    bio: string;
    location: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  createdAt: Date;
}

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

// Demonstrate type safety benefits
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