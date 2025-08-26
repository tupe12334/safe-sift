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

// ❌ Compile-time errors
new SafeSift<User>({ 
  invalidField: 'value'           // Property doesn't exist
});

new SafeSift<User>({ 
  age: { $regex: /pattern/ }      // Wrong operator for number field
});

new SafeSift<User>({ 
  name: { $size: 5 }             // $size only works on arrays
});

new SafeSift<User>({ 
  'nested.invalid': 'value'       // Invalid nested path
});

// ✅ Valid queries
new SafeSift<User>({ 
  name: { $regex: /john/i },      // Correct operator for string
  age: { $gte: 18 },              // Correct operator for number
  tags: { $size: 3 }              // Correct operator for array
});
```

## Examples

See the `__tests__` directory for comprehensive examples of all supported query types and operators.

## Contributing

Contributions are welcome! Please read the contributing guidelines and ensure all tests pass.

## License

MIT