/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable import/group-exports */
import { DeepKeyOf, PathValue, SafeSiftQuery } from "@types";
import { SafeSift } from "./safe-sift";

type LogicalOperation = "and" | "or";
/**
 * A fluent query builder that constructs type-safe queries for filtering objects and arrays.
 * Uses the builder pattern to create complex queries with logical operators and field conditions.
 *
 * @template T - The type of objects to be queried
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   profile: {
 *     active: boolean;
 *     tags: string[];
 *   }
 * }
 *
 * // Simple equality query
 * const query1 = new QueryBuilder<User>()
 *   .where('name').equals('John')
 *   .build();
 *
 * // Complex query with logical operators
 * const query2 = new QueryBuilder<User>()
 *   .where('age').greaterThan(18)
 *   .and('profile.active').equals(true)
 *   .or('profile.tags').contains('admin')
 *   .build();
 *
 * // Negated query
 * const query3 = new QueryBuilder<User>()
 *   .where('name').equals('Jane')
 *   .not()
 *   .build();
 * ```
 */
export class QueryBuilder<T> {
  private query: SafeSiftQuery<T> = {};
  private currentField: string | null = null;
  private pendingCondition: LogicalOperation | null = null;
  private originalBuild: (() => SafeSiftQuery<T>) | null = null;

  /**
   * Starts a new field condition query. This is typically the first method called when building a query.
   *
   * @param field - The field path to query (supports nested paths with dot notation)
   * @returns A FieldBuilder instance for adding conditions to the specified field
   *
   * @example
   * ```typescript
   * interface User {
   *   name: string;
   *   profile: { age: number };
   * }
   *
   * const query = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .build();
   *
   * // Nested field query
   * const nestedQuery = new QueryBuilder<User>()
   *   .where('profile.age').greaterThan(21)
   *   .build();
   * ```
   */
  where<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K> {
    this.currentField = field;
    return new FieldBuilder(this, field);
  }

  /**
   * Adds an AND condition to the query for the specified field.
   * Creates a logical AND relationship with existing conditions.
   *
   * @param field - The field path to query (supports nested paths with dot notation)
   * @returns A FieldBuilder instance for adding conditions to the specified field
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .and('age').greaterThan(18)
   *   .build();
   *
   * // Results in: { name: 'John', $and: [{ age: { $gt: 18 } }] }
   * ```
   */
  and<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K> {
    return new FieldBuilder(this, field, "and");
  }

  /**
   * Adds an OR condition to the query for the specified field.
   * Creates a logical OR relationship with existing conditions.
   *
   * @param field - The field path to query (supports nested paths with dot notation)
   * @returns A FieldBuilder instance for adding conditions to the specified field
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .or('name').equals('Jane')
   *   .build();
   *
   * // Results in: { $or: [{ name: 'John' }, { name: 'Jane' }] }
   * ```
   */
  or<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K> {
    return new FieldBuilder(this, field, "or");
  }

  /**
   * Negates the entire query by wrapping it in a $not operator.
   * This method modifies the build behavior to return the negated query.
   *
   * @returns This QueryBuilder instance for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .not()
   *   .build();
   *
   * // Results in: { $not: { name: 'John' } }
   * // Matches all users whose name is NOT 'John'
   * ```
   */
  not(): QueryBuilder<T> {
    if (!this.originalBuild) {
      this.originalBuild = this.build.bind(this);

      this.build = () => {
        const query = this.originalBuild!();
        const queryNot = { $not: query };

        // eslint-disable-next-line no-restricted-syntax
        return queryNot as SafeSiftQuery<T>;
      };
    }

    return this;
  }

  /**
   * Compiles and returns the constructed query object.
   * This method finalizes the query building process and returns the SafeSiftQuery.
   *
   * @returns The compiled SafeSiftQuery object ready for use with SafeSift
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('age').greaterThan(18)
   *   .and('active').equals(true)
   *   .build();
   *
   * console.log(query); // { age: { $gt: 18 }, $and: [{ active: true }] }
   * ```
   */
  build(): SafeSiftQuery<T> {
    return this.query;
  }

  /**
   * Builds the query and immediately returns a SafeSift instance for executing operations.
   * This is a convenience method that combines build() and new SafeSift().
   *
   * @returns A SafeSift instance ready to filter, find, or test objects
   *
   * @example
   * ```typescript
   * const users = [
   *   { name: 'John', age: 25 },
   *   { name: 'Jane', age: 30 }
   * ];
   *
   * const filtered = new QueryBuilder<User>()
   *   .where('age').greaterThan(20)
   *   .execute()
   *   .filter(users);
   *
   * console.log(filtered); // [{ name: 'John', age: 25 }, { name: 'Jane', age: 30 }]
   * ```
   */
  execute(): SafeSift<T> {
    return new SafeSift(this.build());
  }

  /**
   * Clears all conditions from the query, resetting it to an empty state.
   *
   * @returns This QueryBuilder instance for method chaining
   *
   * @example
   * ```typescript
   * const builder = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .and('age').greaterThan(18);
   *
   * builder.clear(); // Query is now empty: {}
   *
   * builder.where('status').equals('active'); // Start fresh
   * ```
   */
  clear(): QueryBuilder<T> {
    this.query = {};
    return this;
  }

  /**
   * Removes a specific field condition from the query.
   *
   * @param field - The field path to remove from the query
   * @returns This QueryBuilder instance for method chaining
   *
   * @example
   * ```typescript
   * const builder = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .and('age').greaterThan(18)
   *   .removeField('age'); // Removes age condition
   *
   * // Query now only contains: { name: 'John' }
   * ```
   */
  removeField<K extends DeepKeyOf<T>>(field: K): QueryBuilder<T> {
    delete this.query[field];
    return this;
  }

  /**
   * Removes all OR conditions from the query.
   *
   * @returns This QueryBuilder instance for method chaining
   *
   * @example
   * ```typescript
   * const builder = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .or('name').equals('Jane')
   *   .removeOr();
   *
   * // OR conditions are removed, other conditions remain
   * ```
   */
  removeOr(): QueryBuilder<T> {
    if (this.query.$or) {
      delete this.query.$or;
    }
    return this;
  }

  /**
   * Removes all AND conditions from the query.
   *
   * @returns This QueryBuilder instance for method chaining
   *
   * @example
   * ```typescript
   * const builder = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .and('age').greaterThan(18)
   *   .removeAnd();
   *
   * // AND conditions are removed: { name: 'John' }
   * ```
   */
  removeAnd(): QueryBuilder<T> {
    if (this.query.$and) {
      delete this.query.$and;
    }
    return this;
  }

  /**
   * Removes the NOT negation from the query, restoring the original query structure.
   *
   * @returns This QueryBuilder instance for method chaining
   *
   * @example
   * ```typescript
   * const builder = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .not()
   *   .removeNot();
   *
   * // NOT negation removed, back to: { name: 'John' }
   * ```
   */
  removeNot(): QueryBuilder<T> {
    if (this.originalBuild) {
      this.build = this.originalBuild;
      this.originalBuild = null;
    }
    return this;
  }

  /**
   * Removes all logical operators ($or, $and, $not) from the query.
   * This is a comprehensive method that cleans up all logical structuring.
   *
   * @returns This QueryBuilder instance for method chaining
   *
   * @example
   * ```typescript
   * const builder = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .and('age').greaterThan(18)
   *   .or('status').equals('admin')
   *   .not()
   *   .removeLogical();
   *
   * // All logical operators removed, only field conditions remain
   * ```
   */
  removeLogical(): QueryBuilder<T> {
    delete this.query.$or;
    delete this.query.$and;
    delete this.query.$not;
    // Also remove NOT by restoring original build method
    if (this.originalBuild) {
      this.build = this.originalBuild;
      this.originalBuild = null;
    }
    return this;
  }

  /**
   * Internal method that adds a condition to the query with optional logical grouping.
   * Handles the logic for combining conditions with AND/OR operators.
   *
   * @param field - The field name to add the condition for
   * @param condition - The condition object or value to apply
   * @param logical - Optional logical operator ('and' or 'or') for combining conditions
   *
   * @internal This method is for internal use by FieldBuilder instances
   *
   * @example
   * ```typescript
   * // Called internally by FieldBuilder methods:
   * builder._addCondition('name', 'John'); // Direct field assignment
   * builder._addCondition('age', { $gt: 18 }, 'and'); // AND condition
   * builder._addCondition('status', 'active', 'or'); // OR condition
   * ```
   */
  _addCondition(
    field: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    condition: any,
    logical?: LogicalOperation
  ): void {
    if (logical === "or") {
      if (!this.query.$or) {
        // Convert existing query to OR format
        const existingConditions = { ...this.query };
        delete existingConditions.$or;
        delete existingConditions.$and;
        delete existingConditions.$not;

        this.query = { $or: [] } as SafeSiftQuery<T>;

        // Add existing conditions as the first OR clause
        if (Object.keys(existingConditions).length > 0) {
          this.query.$or!.push(existingConditions as SafeSiftQuery<T>);
        }
      }
      this.query.$or!.push({ [field]: condition } as SafeSiftQuery<T>);
    } else if (logical === "and") {
      if (!this.query.$and) {
        this.query.$and = [];
      }
      this.query.$and.push({ [field]: condition } as SafeSiftQuery<T>);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.query as any)[field] = condition;
    }
  }
}

/**
 * A specialized builder for adding conditions to a specific field in a query.
 * Created by QueryBuilder methods (where, and, or) to provide field-specific query operations.
 *
 * @template T - The type of objects being queried
 * @template K - The specific field path being queried (extends DeepKeyOf<T>)
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   tags: string[];
 * }
 *
 * // FieldBuilder is created by QueryBuilder.where()
 * const query = new QueryBuilder<User>()
 *   .where('name') // Returns FieldBuilder<User, 'name'>
 *   .equals('John') // FieldBuilder method
 *   .build();
 *
 * // Chaining different field conditions
 * const complexQuery = new QueryBuilder<User>()
 *   .where('age').greaterThan(18)
 *   .and('tags').contains('admin')
 *   .build();
 * ```
 */

export class FieldBuilder<T, K extends DeepKeyOf<T>> {
  /**
   * Creates a new FieldBuilder instance for a specific field.
   *
   * @param builder - The QueryBuilder instance that created this FieldBuilder
   * @param field - The field path this builder will add conditions to
   * @param logical - Optional logical operator for combining this condition with others
   */
  constructor(
    private builder: QueryBuilder<T>,
    private field: K,
    private logical?: LogicalOperation
  ) {}

  /**
   * Internal method that adds a condition for this field and returns the parent QueryBuilder.
   *
   * @param condition - The condition to apply to this field
   * @returns The parent QueryBuilder instance for continued chaining
   *
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addCondition(condition: any): QueryBuilder<T> {
    this.builder._addCondition(this.field, condition, this.logical);
    return this.builder;
  }

  /**
   * Creates an equality condition for this field (shorthand for exact match).
   *
   * @param value - The exact value to match against
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('name').equals('John')
   *   .build();
   *
   * // Results in: { name: 'John' }
   * ```
   */
  equals(value: PathValue<T, K>): QueryBuilder<T> {
    return this.addCondition(value);
  }

  /**
   * Creates an explicit equality condition using the $eq operator.
   *
   * @param value - The exact value to match against
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('status').eq('active')
   *   .build();
   *
   * // Results in: { status: { $eq: 'active' } }
   * ```
   */
  eq(value: PathValue<T, K>): QueryBuilder<T> {
    return this.addCondition({ $eq: value });
  }

  /**
   * Creates a not-equals condition for this field.
   *
   * @param value - The value that should NOT match
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('status').notEquals('deleted')
   *   .build();
   *
   * // Results in: { status: { $ne: 'deleted' } }
   * ```
   */
  notEquals(value: PathValue<T, K>): QueryBuilder<T> {
    return this.addCondition({ $ne: value });
  }

  /**
   * Creates a not-equals condition for this field (alias for notEquals).
   *
   * @param value - The value that should NOT match
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('age').ne(0)
   *   .build();
   *
   * // Results in: { age: { $ne: 0 } }
   * ```
   */
  ne(value: PathValue<T, K>): QueryBuilder<T> {
    return this.addCondition({ $ne: value });
  }

  /**
   * Creates a greater-than condition for comparable fields (string, number, Date).
   *
   * @param value - The value to compare against (field value must be greater than this)
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('age').greaterThan(18)
   *   .build();
   *
   * // Results in: { age: { $gt: 18 } }
   *
   * // Works with strings (alphabetical comparison)
   * const nameQuery = new QueryBuilder<User>()
   *   .where('name').greaterThan('M')
   *   .build();
   *
   * // Works with dates
   * const dateQuery = new QueryBuilder<Post>()
   *   .where('createdAt').greaterThan(new Date('2023-01-01'))
   *   .build();
   * ```
   */
  greaterThan(
    value: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $gt: value });
  }

  /**
   * Creates a greater-than condition (alias for greaterThan).
   *
   * @param value - The value to compare against
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('score').gt(100)
   *   .build();
   *
   * // Results in: { score: { $gt: 100 } }
   * ```
   */
  gt(
    value: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $gt: value });
  }

  /**
   * Creates a greater-than-or-equal condition for comparable fields.
   *
   * @param value - The value to compare against (field value must be >= this)
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('age').greaterThanOrEqual(21)
   *   .build();
   *
   * // Results in: { age: { $gte: 21 } }
   * ```
   */
  greaterThanOrEqual(
    value: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $gte: value });
  }

  /**
   * Creates a greater-than-or-equal condition (alias for greaterThanOrEqual).
   *
   * @param value - The value to compare against
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('rating').gte(4.5)
   *   .build();
   *
   * // Results in: { rating: { $gte: 4.5 } }
   * ```
   */
  gte(
    value: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $gte: value });
  }

  /**
   * Creates a less-than condition for comparable fields.
   *
   * @param value - The value to compare against (field value must be less than this)
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('age').lessThan(65)
   *   .build();
   *
   * // Results in: { age: { $lt: 65 } }
   * ```
   */
  lessThan(
    value: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $lt: value });
  }

  /**
   * Creates a less-than condition (alias for lessThan).
   *
   * @param value - The value to compare against
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('attempts').lt(3)
   *   .build();
   *
   * // Results in: { attempts: { $lt: 3 } }
   * ```
   */
  lt(
    value: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $lt: value });
  }

  /**
   * Creates a less-than-or-equal condition for comparable fields.
   *
   * @param value - The value to compare against (field value must be <= this)
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('age').lessThanOrEqual(35)
   *   .build();
   *
   * // Results in: { age: { $lte: 35 } }
   * ```
   */
  lessThanOrEqual(
    value: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $lte: value });
  }

  /**
   * Creates a less-than-or-equal condition (alias for lessThanOrEqual).
   *
   * @param value - The value to compare against
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('priority').lte(5)
   *   .build();
   *
   * // Results in: { priority: { $lte: 5 } }
   * ```
   */
  lte(
    value: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $lte: value });
  }

  /**
   * Creates a condition that matches if the field value is included in the provided array.
   * For array fields, checks if the array contains any of the specified values.
   * For non-array fields, checks if the field value matches any value in the array.
   *
   * @param values - Array of values to match against
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * // For non-array fields
   * const query = new QueryBuilder<User>()
   *   .where('status').in(['active', 'pending'])
   *   .build();
   *
   * // Results in: { status: { $in: ['active', 'pending'] } }
   *
   * // For array fields - checks if the array contains any of these values
   * const tagQuery = new QueryBuilder<User>()
   *   .where('tags').in(['admin', 'moderator'])
   *   .build();
   * ```
   */
  in(
    values: PathValue<T, K> extends ReadonlyArray<infer U>
      ? U[]
      : PathValue<T, K>[]
  ): QueryBuilder<T> {
    return this.addCondition({ $in: values });
  }

  /**
   * Creates a condition that matches if the field value is NOT included in the provided array.
   * Opposite of the `in` method.
   *
   * @param values - Array of values to exclude
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('status').notIn(['deleted', 'banned'])
   *   .build();
   *
   * // Results in: { status: { $nin: ['deleted', 'banned'] } }
   * ```
   */
  notIn(
    values: PathValue<T, K> extends ReadonlyArray<infer U>
      ? U[]
      : PathValue<T, K>[]
  ): QueryBuilder<T> {
    return this.addCondition({ $nin: values });
  }

  /**
   * Creates a condition that matches if the field value is NOT included in the provided array.
   * Alias for `notIn`.
   *
   * @param values - Array of values to exclude
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('role').nin(['guest', 'temp'])
   *   .build();
   *
   * // Results in: { role: { $nin: ['guest', 'temp'] } }
   * ```
   */
  nin(
    values: PathValue<T, K> extends ReadonlyArray<infer U>
      ? U[]
      : PathValue<T, K>[]
  ): QueryBuilder<T> {
    return this.addCondition({ $nin: values });
  }

  /**
   * Creates a condition that matches if an array field contains the specified value.
   * Only works with array fields.
   *
   * @param value - The value that should be present in the array
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('tags').contains('admin')
   *   .build();
   *
   * // Results in: { tags: 'admin' }
   * // Matches users whose tags array includes 'admin'
   * ```
   */
  contains(
    value: PathValue<T, K> extends ReadonlyArray<infer U> ? U : never
  ): QueryBuilder<T> {
    return this.addCondition(value);
  }

  /**
   * Creates a condition that matches string fields against a regular expression pattern.
   * Only works with string fields.
   *
   * @param pattern - Regular expression pattern (RegExp object or string)
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('email').regex(/@gmail\.com$/)
   *   .build();
   *
   * // Results in: { email: { $regex: /@gmail\.com$/ } }
   * // Matches users with Gmail email addresses
   *
   * // Using string pattern
   * const nameQuery = new QueryBuilder<User>()
   *   .where('name').regex('^John')
   *   .build();
   *
   * // Results in: { name: { $regex: '^John' } }
   * // Matches users whose name starts with 'John'
   * ```
   */
  regex(
    pattern: PathValue<T, K> extends string ? RegExp | string : never
  ): QueryBuilder<T> {
    return this.addCondition({ $regex: pattern });
  }

  /**
   * Creates a condition that matches string fields against a regular expression pattern.
   * Alias for `regex` method. Only works with string fields.
   *
   * @param pattern - Regular expression pattern (RegExp object or string)
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('phone').matches(/^\+1\d{10}$/)
   *   .build();
   *
   * // Results in: { phone: { $regex: /^\+1\d{10}$/ } }
   * // Matches US phone numbers
   * ```
   */
  matches(
    pattern: PathValue<T, K> extends string ? RegExp | string : never
  ): QueryBuilder<T> {
    return this.addCondition({ $regex: pattern });
  }

  /**
   * Creates a condition that checks if a field exists (is not null or undefined).
   *
   * @param value - Whether the field should exist (default: true)
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * // Check if field exists
   * const query = new QueryBuilder<User>()
   *   .where('middleName').exists()
   *   .build();
   *
   * // Results in: { middleName: { $exists: true } }
   * // Matches users who have a middle name
   *
   * // Check if field does NOT exist
   * const noMiddleNameQuery = new QueryBuilder<User>()
   *   .where('middleName').exists(false)
   *   .build();
   *
   * // Results in: { middleName: { $exists: false } }
   * // Matches users who do NOT have a middle name
   * ```
   */
  exists(value: boolean = true): QueryBuilder<T> {
    return this.addCondition({ $exists: value });
  }

  /**
   * Creates a condition that matches arrays with a specific length.
   * Only works with array fields.
   *
   * @param value - The exact length the array should have
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('tags').size(3)
   *   .build();
   *
   * // Results in: { tags: { $size: 3 } }
   * // Matches users with exactly 3 tags
   * ```
   */
  size(
    value: PathValue<T, K> extends ReadonlyArray<unknown> ? number : never
  ): QueryBuilder<T> {
    return this.addCondition({ $size: value });
  }

  /**
   * Creates a condition that matches arrays containing ALL of the specified values.
   * The array must contain every value in the provided array, but may contain additional values.
   * Only works with array fields.
   *
   * @param values - Array of values that must ALL be present in the field
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('tags').all(['admin', 'active'])
   *   .build();
   *
   * // Results in: { tags: { $all: ['admin', 'active'] } }
   * // Matches users whose tags array contains BOTH 'admin' AND 'active'
   * ```
   */
  all(
    values: PathValue<T, K> extends ReadonlyArray<infer U> ? U[] : never
  ): QueryBuilder<T> {
    return this.addCondition({ $all: values });
  }

  /**
   * Creates a condition that matches arrays where at least one element matches the given query.
   * Useful for querying arrays of objects. Only works with array fields.
   *
   * @param query - A SafeSiftQuery to apply to each array element
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * interface User {
   *   orders: Array<{ status: string; amount: number }>;
   * }
   *
   * const query = new QueryBuilder<User>()
   *   .where('orders').elemMatch({ status: 'completed', amount: { $gt: 100 } })
   *   .build();
   *
   * // Results in: { orders: { $elemMatch: { status: 'completed', amount: { $gt: 100 } } } }
   * // Matches users who have at least one completed order over $100
   * ```
   */
  elemMatch(
    query: PathValue<T, K> extends ReadonlyArray<infer U>
      ? SafeSiftQuery<U>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $elemMatch: query });
  }

  /**
   * Creates a range condition for comparable fields (between min and max, inclusive).
   * This is equivalent to combining greaterThanOrEqual(min) and lessThanOrEqual(max).
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns The parent QueryBuilder for method chaining
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder<User>()
   *   .where('age').between(18, 65)
   *   .build();
   *
   * // Results in: { age: { $gte: 18, $lte: 65 } }
   *
   * // Works with dates for date ranges
   * const dateQuery = new QueryBuilder<Post>()
   *   .where('createdAt').between(
   *     new Date('2023-01-01'),
   *     new Date('2023-12-31')
   *   )
   *   .build();
   * ```
   */
  between(
    min: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never,
    max: PathValue<T, K> extends string | number | Date
      ? PathValue<T, K>
      : never
  ): QueryBuilder<T> {
    return this.addCondition({ $gte: min, $lte: max });
  }
}

/**
 * Factory function that creates a new QueryBuilder instance.
 * This is the main entry point for building type-safe queries.
 *
 * @template T - The type of objects to be queried
 * @returns A new QueryBuilder instance for type T
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   age: number;
 *   profile: {
 *     active: boolean;
 *     tags: string[];
 *   }
 * }
 *
 * // Create a simple query
 * const simpleQuery = query<User>()
 *   .where('name').equals('John')
 *   .build();
 *
 * // Create a complex query with multiple conditions
 * const complexQuery = query<User>()
 *   .where('age').greaterThan(18)
 *   .and('profile.active').equals(true)
 *   .or('profile.tags').contains('admin')
 *   .build();
 *
 * // Use with SafeSift for filtering
 * const users = [
 *   { name: 'John', age: 25, profile: { active: true, tags: ['user'] } },
 *   { name: 'Jane', age: 30, profile: { active: true, tags: ['admin'] } }
 * ];
 *
 * const filtered = query<User>()
 *   .where('profile.tags').contains('admin')
 *   .execute()
 *   .filter(users);
 *
 * console.log(filtered); // [{ name: 'Jane', age: 30, profile: { active: true, tags: ['admin'] } }]
 * ```
 */

export function query<T>(): QueryBuilder<T> {
  return new QueryBuilder<T>();
}

// TODO: split this file to multiple files and fix all the eslint disable
