# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Safe Sift is a TypeScript library that provides type-safe MongoDB-style queries using sift.js. It offers compile-time validation and IntelliSense support for querying JavaScript objects with both a fluent builder API and direct query API.

## Development Commands

### Build and Development
- `npm run build` - Build the TypeScript project to dist/
- `npm run dev` - Watch mode compilation with TypeScript
- `npm run typecheck` - Run TypeScript type checking without emitting files

### Testing
- `npm test` - Run all tests with Vitest
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Generate test coverage reports

### Code Quality
- `npm run lint` - Run ESLint on src/**/*.ts files

### Release Management
- `npm run release` - Create a release using release-it
- `npm run release:patch` - Patch version release
- `npm run release:minor` - Minor version release
- `npm run release:major` - Major version release
- `npm run release:dry` - Dry run release without publishing

## Project Architecture

### Core Module Structure

```
src/
├── index.ts              # Main exports hub - exports all public APIs
├── types.ts              # Advanced TypeScript type definitions for type safety
├── safe-sift.ts          # Core query execution class and functional API
└── query-builder.ts      # Fluent builder pattern implementation
```

### Key Architectural Concepts

**Type Safety System**: The library uses advanced TypeScript features including:
- `DeepKeyOf<T>` - Generates dot-notation paths for nested object access (e.g., 'profile.preferences.theme')
- `DeepValueOf<T, K>` - Extracts value types at specific paths
- `SafeSiftQuery<T>` - Constrains query objects to valid field operations
- Conditional types that restrict operators based on field types (e.g., `$gt` only works on comparable types)

**Dual API Design**: 
1. **SafeSift Class** - Direct instantiation with MongoDB-style query objects
2. **QueryBuilder** - Fluent, chainable API for building queries step-by-step

**Builder Pattern Flow**: `query<T>()` → `where(field)` → `FieldBuilder` → conditions → `build()` or `execute()`

### Type System Implementation

The library's type safety is built on recursive type manipulation that supports:
- Deep nested object queries using dot notation
- Array operations with element matching (`$all`, `$elemMatch`, `$size`)
- Logical operators (`$and`, `$or`, `$not`, `$nor`)
- Field existence and type validation at compile time

## Testing Strategy

Tests are organized in `__tests__/`:
- `safe-sift.test.ts` - Core SafeSift class functionality
- `query-builder.test.ts` - Fluent builder pattern tests

Test data uses a comprehensive User interface with nested objects, arrays, and multiple data types to validate the type system works across complex scenarios.

## Development Patterns

### Adding New Query Operators
1. Extend `ComparisonOperators<T>` in types.ts with type constraints
2. Add corresponding method to `FieldBuilder` class with proper type restrictions
3. Ensure method returns `QueryBuilder<T>` for chaining
4. Add comprehensive tests covering the new operator

### Type Safety Principles
- Always use generic constraints (`K extends DeepKeyOf<T>`) for field access
- Implement conditional types to restrict operators based on field types
- Maintain compile-time safety over runtime flexibility
- Use `PathValue<T, K>` helper type for extracting field value types

### Method Chaining Pattern
All FieldBuilder methods must:
1. Call `this.addCondition(condition)` to add the query condition
2. Return `this.builder` to enable continued chaining
3. Properly handle logical operators ('and', 'or') passed from QueryBuilder

## Code Quality Requirements

- **TypeScript Strict Mode**: All strict compiler options are enabled
- **Zero Runtime Dependencies**: Only depends on sift.js for query execution
- **Complete Type Coverage**: All public APIs have comprehensive JSDoc documentation
- **Test Coverage**: Maintain high test coverage for both unit and integration tests