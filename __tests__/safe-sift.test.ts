import { describe, test, expect } from 'vitest';
import { SafeSift, createQuery, safeSift, query } from '../src/index';

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

const testUsers: User[] = [
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

describe('SafeSift', () => {
  describe('Basic queries', () => {
    test('should filter by equality', () => {
      const query = new SafeSift<User>({ isActive: true });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(2);
      expect(result.every(user => user.isActive)).toBe(true);
    });

    test('should filter by $eq operator', () => {
      const query = new SafeSift<User>({ age: { $eq: 30 } });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should filter by $gt operator', () => {
      const query = new SafeSift<User>({ age: { $gt: 30 } });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Bob Johnson');
    });

    test('should filter by $in operator', () => {
      const query = new SafeSift<User>({ name: { $in: ['John Doe', 'Jane Smith'] } });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(2);
    });

    test('should filter by array contains', () => {
      const query = new SafeSift<User>({ tags: 'developer' });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(2);
    });

    test('should filter by array $all operator', () => {
      const query = new SafeSift<User>({ tags: { $all: ['admin', 'developer'] } });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });
  });

  describe('Nested queries', () => {
    test('should filter by nested properties', () => {
      const query = new SafeSift<User>({ 'profile.location': 'New York' });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should filter by deeply nested properties', () => {
      const query = new SafeSift<User>({ 'profile.preferences.theme': 'dark' });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(2);
    });

    test('should filter by nested object with $elemMatch', () => {
      interface Order {
        id: number;
        items: { name: string; price: number; category: string }[];
      }

      const orders: Order[] = [
        {
          id: 1,
          items: [
            { name: 'Laptop', price: 1000, category: 'electronics' },
            { name: 'Mouse', price: 25, category: 'electronics' },
          ],
        },
        {
          id: 2,
          items: [
            { name: 'Book', price: 15, category: 'books' },
            { name: 'Pen', price: 2, category: 'office' },
          ],
        },
      ];

      const query = new SafeSift<Order>({
        items: { $elemMatch: { category: 'electronics', price: { $gt: 500 } } },
      });
      const result = query.filter(orders);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(1);
    });
  });

  describe('Logical operators', () => {
    test('should filter with $and operator', () => {
      const query = new SafeSift<User>({
        $and: [{ age: { $gte: 30 } }, { isActive: true }],
      });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(2);
    });

    test('should filter with $or operator', () => {
      const query = new SafeSift<User>({
        $or: [{ age: { $lt: 26 } }, { name: 'Bob Johnson' }],
      });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(2);
    });

    test('should filter with $not operator', () => {
      const query = new SafeSift<User>({
        $not: { isActive: true },
      });
      const result = query.filter(testUsers);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Jane Smith');
    });
  });

  describe('Array methods', () => {
    test('should test single object with test method', () => {
      const query = new SafeSift<User>({ isActive: true });
      expect(query.test(testUsers[0]!)).toBe(true);
      expect(query.test(testUsers[1]!)).toBe(false);
    });

    test('should find first matching item', () => {
      const query = new SafeSift<User>({ age: { $gt: 25 } });
      const result = query.find(testUsers);
      expect(result?.name).toBe('John Doe');
    });

    test('should find index of first matching item', () => {
      const query = new SafeSift<User>({ name: 'Jane Smith' });
      const result = query.findIndex(testUsers);
      expect(result).toBe(1);
    });

    test('should check if some items match', () => {
      const query = new SafeSift<User>({ age: { $gt: 40 } });
      expect(query.some(testUsers)).toBe(false);
      
      const query2 = new SafeSift<User>({ age: { $gt: 20 } });
      expect(query2.some(testUsers)).toBe(true);
    });

    test('should check if all items match', () => {
      const query = new SafeSift<User>({ age: { $gt: 20 } });
      expect(query.every(testUsers)).toBe(true);
      
      const query2 = new SafeSift<User>({ isActive: true });
      expect(query2.every(testUsers)).toBe(false);
    });

    test('should count matching items', () => {
      const query = new SafeSift<User>({ isActive: true });
      expect(query.count(testUsers)).toBe(2);
    });
  });
});

describe('createQuery function', () => {
  test('should create SafeSift instance', () => {
    const query = createQuery<User>({ isActive: true });
    expect(query).toBeInstanceOf(SafeSift);
    const result = query.filter(testUsers);
    expect(result).toHaveLength(2);
  });
});

describe('safeSift function', () => {
  test('should return query functions', () => {
    const { filter, find, test, count } = safeSift<User>({ isActive: true });
    
    expect(filter(testUsers)).toHaveLength(2);
    expect(find(testUsers)?.name).toBe('John Doe');
    expect(test(testUsers[0]!)).toBe(true);
    expect(count(testUsers)).toBe(2);
  });
});

describe('Type safety', () => {
  test('should provide compile-time type checking', () => {
    // These should all compile without errors due to proper typing
    const validQueries = [
      new SafeSift<User>({ id: 1 }),
      new SafeSift<User>({ name: { $regex: /john/i } }),
      new SafeSift<User>({ age: { $gte: 18, $lt: 65 } }),
      new SafeSift<User>({ isActive: { $exists: true } }),
      new SafeSift<User>({ tags: { $size: 2 } }),
      new SafeSift<User>({ 'profile.bio': 'Software engineer' }),
      new SafeSift<User>({ 'profile.preferences.theme': 'dark' }),
    ];

    validQueries.forEach(query => {
      expect(query).toBeInstanceOf(SafeSift);
    });
  });

  test('should work with generic functions and type constraints', () => {
    // Test the specific use case: generic function with type constraint
    type A = { type: string };

    const func = <T extends A>(array: T[]): T[] => {
      return query<T>().where('type').equals('test').execute().filter(array);
    };

    // Test with concrete type that extends A
    interface TestItem extends A {
      type: string;
      name: string;
      value: number;
    }

    const testData: TestItem[] = [
      { type: 'test', name: 'item1', value: 10 },
      { type: 'other', name: 'item2', value: 20 },
      { type: 'test', name: 'item3', value: 30 },
    ];

    const result = func(testData);
    
    expect(result).toHaveLength(2);
    expect(result.every(item => item.type === 'test')).toBe(true);
    expect(result[0]?.name).toBe('item1');
    expect(result[1]?.name).toBe('item3');
  });
});