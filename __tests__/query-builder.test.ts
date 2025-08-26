import { describe, test, expect } from 'vitest';
import { query } from '../src/query-builder';

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

describe('QueryBuilder', () => {
  describe('Basic field operations', () => {
    test('should build equality query', () => {
      const result = query<User>()
        .where('isActive').equals(true)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
      expect(result.every(user => user.isActive)).toBe(true);
    });

    test('should build explicit $eq query', () => {
      const result = query<User>()
        .where('age').eq(30)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should build not equals query', () => {
      const result = query<User>()
        .where('age').notEquals(30)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
      expect(result.every(user => user.age !== 30)).toBe(true);
    });

    test('should build greater than query', () => {
      const result = query<User>()
        .where('age').greaterThan(30)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Bob Johnson');
    });

    test('should build range query with between', () => {
      const result = query<User>()
        .where('age').between(25, 30)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
      expect(result.every(user => user.age >= 25 && user.age <= 30)).toBe(true);
    });
  });

  describe('String operations', () => {
    test('should build regex query', () => {
      const result = query<User>()
        .where('name').regex(/^John/i)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should build matches query', () => {
      const result = query<User>()
        .where('email').matches(/@example\.com$/)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('Array operations', () => {
    test('should build contains query', () => {
      const result = query<User>()
        .where('tags').contains('developer')
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
    });

    test('should build in query for arrays', () => {
      const result = query<User>()
        .where('tags').in(['admin', 'designer'])
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
    });

    test('should build all query', () => {
      const result = query<User>()
        .where('tags').all(['admin', 'developer'])
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should build size query', () => {
      const result = query<User>()
        .where('tags').size(2)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('Nested field operations', () => {
    test('should build nested field query', () => {
      const result = query<User>()
        .where('profile.location').equals('New York')
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    test('should build deep nested query', () => {
      const result = query<User>()
        .where('profile.preferences.theme').equals('dark')
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('Logical operations', () => {
    test('should build AND query', () => {
      const result = query<User>()
        .where('isActive').equals(true)
        .and('age').greaterThanOrEqual(30)
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
      expect(result.every(user => user.isActive && user.age >= 30)).toBe(true);
    });

    test('should build OR query', () => {
      const result = query<User>()
        .where('age').lessThan(26)
        .or('name').equals('Bob Johnson')
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
    });

    test('should build complex logical query', () => {
      const result = query<User>()
        .where('age').greaterThanOrEqual(25)
        .and('isActive').equals(true)
        .or('tags').contains('manager')
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(3);
    });

    test('should build NOT query', () => {
      const result = query<User>()
        .where('isActive').equals(true)
        .not()
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Jane Smith');
    });
  });

  describe('Existence and type queries', () => {
    test('should build exists query', () => {
      const result = query<User>()
        .where('profile.bio').exists()
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(3);
    });

    test('should build not exists query', () => {
      interface OptionalUser extends User {
        nickname?: string;
      }
      
      const usersWithOptional: OptionalUser[] = [
        { ...testUsers[0]!, nickname: 'Johnny' },
        { ...testUsers[1]! },
        { ...testUsers[2]! }
      ];
      
      const result = query<OptionalUser>()
        .where('nickname').exists(false)
        .execute()
        .filter(usersWithOptional);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('Date operations', () => {
    test('should build date comparison query', () => {
      const result = query<User>()
        .where('createdAt').greaterThan(new Date('2023-01-01'))
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
    });

    test('should build date range query', () => {
      const result = query<User>()
        .where('createdAt').between(
          new Date('2023-01-01'),
          new Date('2023-12-31')
        )
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('Method chaining and fluency', () => {
    test('should support long method chains', () => {
      const result = query<User>()
        .where('age').greaterThanOrEqual(20)
        .and('isActive').equals(true)
        .and('tags').contains('developer')
        .and('profile.preferences.theme').equals('dark')
        .execute()
        .filter(testUsers);
      
      expect(result).toHaveLength(2);
    });

    test('should build query object correctly', () => {
      const builtQuery = query<User>()
        .where('isActive').equals(true)
        .and('age').greaterThan(25)
        .build();
      
      expect(builtQuery).toEqual({
        isActive: true,
        $and: [{ age: { $gt: 25 } }]
      });
    });
  });

  describe('Type safety', () => {
    test('should provide compile-time type checking for field names', () => {
      // These should all compile without errors due to proper typing
      const validQueries = [
        query<User>().where('id').equals(1),
        query<User>().where('name').regex(/test/),
        query<User>().where('age').between(18, 65),
        query<User>().where('isActive').exists(),
        query<User>().where('tags').size(2),
        query<User>().where('profile.bio').equals('test'),
        query<User>().where('profile.preferences.theme').equals('dark'),
      ];

      validQueries.forEach(queryBuilder => {
        expect(queryBuilder).toBeDefined();
      });
    });
  });

  describe('Removal operations', () => {
    test('should clear all conditions', () => {
      const builder = query<User>()
        .where('age').equals(30)
        .or('name').equals('John')
        .clear();
      
      const builtQuery = builder.build();
      expect(Object.keys(builtQuery)).toHaveLength(0);
    });

    test('should remove specific field', () => {
      const builder = query<User>()
        .where('age').equals(30)
        .and('name').equals('John');
      
      let builtQuery = builder.build();
      expect(builtQuery).toHaveProperty('age');
      expect(builtQuery.$and).toHaveLength(1);
      
      builder.removeField('age');
      builtQuery = builder.build();
      expect(builtQuery).not.toHaveProperty('age');
      expect(builtQuery.$and).toHaveLength(1);
    });

    test('should remove OR conditions', () => {
      const builder = query<User>()
        .where('age').equals(30)
        .or('name').equals('John');
      
      let builtQuery = builder.build();
      expect(builtQuery).toHaveProperty('$or');
      
      builder.removeOr();
      builtQuery = builder.build();
      expect(builtQuery).not.toHaveProperty('$or');
    });

    test('should remove AND conditions', () => {
      const builder = query<User>()
        .where('age').equals(30)
        .and('name').equals('John');
      
      let builtQuery = builder.build();
      expect(builtQuery).toHaveProperty('$and');
      
      builder.removeAnd();
      builtQuery = builder.build();
      expect(builtQuery).not.toHaveProperty('$and');
    });

    test('should remove NOT conditions', () => {
      const builder = query<User>()
        .where('age').equals(30)
        .not();
      
      let builtQuery = builder.build();
      expect(builtQuery).toHaveProperty('$not');
      
      builder.removeNot();
      builtQuery = builder.build();
      expect(builtQuery).not.toHaveProperty('$not');
    });

    test('should remove all logical operators', () => {
      const builder = query<User>()
        .where('age').equals(30)
        .or('name').equals('John')
        .and('isActive').equals(true)
        .not();
      
      let builtQuery = builder.build();
      expect(builtQuery).toHaveProperty('$not');
      
      builder.removeLogical();
      builtQuery = builder.build();
      expect(builtQuery).not.toHaveProperty('$or');
      expect(builtQuery).not.toHaveProperty('$and');
      expect(builtQuery).not.toHaveProperty('$not');
    });

    test('should chain removal operations', () => {
      const builder = query<User>()
        .where('age').equals(30)
        .or('name').equals('John');
      
      // Initially has OR
      let builtQuery = builder.build();
      expect(builtQuery).toHaveProperty('$or');
      
      // Remove OR and add new condition
      builder.removeOr().and('isActive').equals(true);
      
      builtQuery = builder.build();
      expect(builtQuery).not.toHaveProperty('$or');
      expect(builtQuery).toHaveProperty('$and');
    });

    test('should handle removal on empty query', () => {
      const builder = query<User>()
        .clear()
        .removeField('age')
        .removeOr()
        .removeAnd()
        .removeNot();
      
      const builtQuery = builder.build();
      expect(Object.keys(builtQuery)).toHaveLength(0);
    });
  });
});