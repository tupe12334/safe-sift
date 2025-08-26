import { SafeSift, safeSift, createQuery } from './index';

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
];

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

// Type safety demonstrations
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

// Advanced examples with complex data structures
interface Order {
  id: string;
  customerId: number;
  items: {
    name: string;
    price: number;
    category: string;
    tags: string[];
  }[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  metadata: {
    source: string;
    discount?: number;
  };
}

export function advancedExamples(): void {
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
    'items.tags': 'computer'
  }).filter(orders);
  console.log('Orders containing computer items:', computerOrders.length);
}