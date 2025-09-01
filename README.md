# Safe Sift

A type-safe wrapper for [sift.js](https://github.com/crcn/sift.js) that provides compile-time query validation and autocompletion for MongoDB-style queries.

## Features

- 🛡️ **Type Safety**: Compile-time validation of queries against your data schema
- 🔍 **IntelliSense**: Full autocompletion support for query operators and field names
- 🎯 **Deep Object Support**: Type-safe querying of nested properties
- 📦 **Zero Dependencies**: Only depends on sift.js
- 🚀 **Performance**: No runtime overhead beyond sift.js itself

## Installation

```bash
npm install safe-sift sift
```

## Usage

### Fluent Builder Pattern (Recommended)

```typescript
import { query } from 'safe-sift';

interface User {
  id: number;
  name: string;
  age: number;
  isActive: boolean;
  tags: string[];
  profile: {
    location: string;
    preferences: { theme: 'light' | 'dark' };
  };
}

const users: User[] = [/* ... */];

// Fluent, type-safe query building
const result = query<User>()
  .where('isActive').equals(true)
  .and('age').between(25, 40)
  .and('tags').contains('developer')
  .and('profile.preferences.theme').equals('dark')
  .execute()
  .filter(users);

// Or build query object for later use
const queryObj = query<User>()
  .where('name').regex(/john/i)
  .or('email').matches(/@company\.com$/)
  .build(); // Returns SafeSiftQuery<User>
```

### Basic Example

```typescript
import { SafeSift, safeSift } from 'safe-sift';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  tags: string[];
}

const users: User[] = [
  { id: 1, name: 'John', email: 'john@example.com', age: 30, isActive: true, tags: ['admin'] },
  { id: 2, name: 'Jane', email: 'jane@example.com', age: 25, isActive: false, tags: ['user'] },
];

// Class-based approach
const query = new SafeSift<User>({ 
  isActive: true, 
  age: { $gte: 25 } 
});

const activeUsers = query.filter(users);
console.log(activeUsers); // [{ id: 1, name: 'John', ... }]

// Functional approach
const { filter, find, test } = safeSift<User>({ 
  tags: { $in: ['admin', 'moderator'] } 
});

const adminUsers = filter(users);
const firstAdmin = find(users);
const isAdmin = test(users[0]);
```

### Nested Object Queries

```typescript
interface User {
  profile: {
    bio: string;
    location: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
}

// Type-safe nested property access
const darkThemeUsers = new SafeSift<User>({
  'profile.preferences.theme': 'dark'
});

// Compile-time error for invalid paths
const invalid = new SafeSift<User>({
  'profile.invalid.path': 'value' // ❌ TypeScript error
});
```

### Array Operations

```typescript
interface Order {
  items: { name: string; price: number; category: string }[];
}

// Array element matching
const expensiveElectronics = new SafeSift<Order>({
  items: { 
    $elemMatch: { 
      category: 'electronics', 
      price: { $gt: 500 } 
    } 
  }
});

// Array contains all elements
const multiCategoryOrders = new SafeSift<Order>({
  'items.category': { $all: ['electronics', 'books'] }
});
```

### Logical Operators

```typescript
// Complex logical queries
const complexQuery = new SafeSift<User>({
  $and: [
    { age: { $gte: 18 } },
    {
      $or: [
        { isActive: true },
        { tags: { $in: ['vip', 'premium'] } }
      ]
    }
  ]
});
```

### Builder Pattern Methods

#### QueryBuilder

```typescript
// Start building a query
query<T>(): QueryBuilder<T>

// Field selection
where<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K>
and<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K>
or<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K>
not(): QueryBuilder<T>

// Finalization
build(): SafeSiftQuery<T>
execute(): SafeSift<T>
```

#### FieldBuilder Operations

```typescript
// Equality
equals(value): QueryBuilder<T>
eq(value): QueryBuilder<T>
notEquals(value): QueryBuilder<T>
ne(value): QueryBuilder<T>

// Comparisons (numbers, strings, dates)
greaterThan(value): QueryBuilder<T>
gt(value): QueryBuilder<T>
greaterThanOrEqual(value): QueryBuilder<T>
gte(value): QueryBuilder<T>
lessThan(value): QueryBuilder<T>
lt(value): QueryBuilder<T>
lessThanOrEqual(value): QueryBuilder<T>
lte(value): QueryBuilder<T>
between(min, max): QueryBuilder<T>

// Arrays and collections
in(values): QueryBuilder<T>
notIn(values): QueryBuilder<T>
nin(values): QueryBuilder<T>
contains(value): QueryBuilder<T>  // Array element matching
all(values): QueryBuilder<T>      // Array contains all
size(value): QueryBuilder<T>      // Array size
elemMatch(query): QueryBuilder<T> // Array element query

// String operations
regex(pattern): QueryBuilder<T>
matches(pattern): QueryBuilder<T>

// Existence
exists(value?): QueryBuilder<T>
```

## API Reference

### SafeSift Class

```typescript
class SafeSift<T> {
  constructor(query: SafeSiftQuery<T>)
  
  test(obj: T): boolean
  filter(array: T[]): T[]
  find(array: T[]): T | undefined
  findIndex(array: T[]): number
  some(array: T[]): boolean
  every(array: T[]): boolean
  count(array: T[]): number
}
```

### Factory Functions

```typescript
// Fluent query builder (recommended)
function query<T>(): QueryBuilder<T>

// Create SafeSift instance
function createQuery<T>(query: SafeSiftQuery<T>): SafeSift<T>

// Get query functions directly
function safeSift<T>(query: SafeSiftQuery<T>): {
  test: (obj: T) => boolean;
  filter: (array: T[]) => T[];
  find: (array: T[]) => T | undefined;
  findIndex: (array: T[]) => number;
  some: (array: T[]) => boolean;
  every: (array: T[]) => boolean;
  count: (array: T[]) => number;
}
```

### Utility Functions

Safe Sift also exports several utility functions for advanced use cases:

```typescript
// Query value extraction
import { getFilterValue, getFilterOps } from 'safe-sift';

// Get a specific operator value or the raw operator bag from a query
const value = getFilterValue(
  { age: { $gte: 18, $lte: 65 } }, 
  'age', 
  '$gte'  // Optional: specific operator
);
console.log(value); // 18

// Get all operator conditions for a field
const ops = getFilterOps({ age: { $gte: 18, $lte: 65 } }, 'age');
console.log(ops); // { $gte: 18, $lte: 65 }

// Query normalization and analysis
import { 
  normalizeQuery, 
  bagFromPreds, 
  isOperatorKey,
  mergeOpsBags,
  normalizeEquality,
  areQueriesEqual 
} from 'safe-sift';

// Normalize a query into predicates
const normalized = normalizeQuery({ 
  age: { $gte: 18 }, 
  name: 'John',
  $or: [{ isActive: true }, { tags: 'admin' }] 
});

// Check if two queries are equivalent
const query1 = { age: { $gte: 18 } };
const query2 = { age: { $gte: 18 } };
const areEqual = areQueriesEqual(query1, query2); // true

// Check if a key is a MongoDB operator
const isOp = isOperatorKey('$gte'); // true
const isField = isOperatorKey('age'); // false

// Merge operator bags
const merged = mergeOpsBags(
  { $gte: 18 }, 
  { $lte: 65 }
); // { $gte: 18, $lte: 65 }

// Normalize equality values
const normalized = normalizeEquality('value'); // { $eq: 'value' }

// Convert predicates to operator bag
const bag = bagFromPreds([
  { path: 'age', op: '$gte', value: 18 },
  { path: 'age', op: '$lte', value: 65 }
]); // { $gte: 18, $lte: 65 }
```

### Supported Operators

#### Comparison Operators
- `$eq` - Equal to
- `$ne` - Not equal to
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$lt` - Less than
- `$lte` - Less than or equal
- `$in` - In array
- `$nin` - Not in array
- `$regex` - Regular expression match
- `$exists` - Field exists
- `$type` - Field type check
- `$size` - Array size

#### Logical Operators
- `$and` - Logical AND
- `$or` - Logical OR
- `$nor` - Logical NOR
- `$not` - Logical NOT

#### Array Operators
- `$all` - Array contains all elements
- `$elemMatch` - Array element matches query

## Type Safety Benefits

Safe Sift prevents common query mistakes at compile time:

```typescript
interface User {
  name: string;
  age: number;
  tags: string[];
}

// ❌ Compile-time errors with traditional approach
new SafeSift<User>({ 
  invalidField: 'value'           // Property doesn't exist
});

// ❌ These would be caught at compile time
query<User>()
  .where('invalidField')          // ❌ Property doesn't exist
  .where('age').regex(/pattern/)  // ❌ Wrong operator for number
  .where('name').size(5)          // ❌ $size only works on arrays

// ✅ Fluent builder with full type safety
query<User>()
  .where('name').regex(/john/i)           // ✅ String regex
  .and('age').between(18, 65)             // ✅ Number range  
  .and('tags').contains('developer')      // ✅ Array contains
  .and('tags').size(3)                    // ✅ Array size
```

### Builder Pattern Benefits

- **IntelliSense**: Full autocompletion for field names and operations
- **Method Chaining**: Readable, fluent API similar to popular libraries
- **Type Safety**: Compile-time validation of all operations
- **Flexibility**: Build queries step by step or all at once

## Examples

See the `__tests__` directory for comprehensive examples of all supported query types and operators.

## Contributing

Contributions are welcome! Please read the contributing guidelines and ensure all tests pass.

## License

MIT