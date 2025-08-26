import { SafeSiftQuery, DeepKeyOf, DeepValueOf } from './types';
import { SafeSift } from './safe-sift';

type PathValue<T, K extends string> = K extends DeepKeyOf<T> ? DeepValueOf<T, K> : never;

export class QueryBuilder<T> {
  private query: SafeSiftQuery<T> = {};
  private currentField: string | null = null;
  private pendingCondition: 'and' | 'or' | null = null;

  where<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K> {
    this.currentField = field;
    return new FieldBuilder(this, field);
  }

  and<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K> {
    return new FieldBuilder(this, field, 'and');
  }

  or<K extends DeepKeyOf<T>>(field: K): FieldBuilder<T, K> {
    return new FieldBuilder(this, field, 'or');
  }

  not(): QueryBuilder<T> {
    const originalBuild = this.build.bind(this);
    
    this.build = () => {
      const query = originalBuild();
      return { $not: query } as SafeSiftQuery<T>;
    };
    
    return this;
  }

  build(): SafeSiftQuery<T> {
    return this.query;
  }

  execute(): SafeSift<T> {
    return new SafeSift(this.build());
  }

  _addCondition(field: string, condition: any, logical?: 'and' | 'or'): void {
    if (logical === 'or') {
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
    } else if (logical === 'and') {
      if (!this.query.$and) {
        this.query.$and = [];
      }
      this.query.$and.push({ [field]: condition } as SafeSiftQuery<T>);
    } else {
      (this.query as any)[field] = condition;
    }
  }
}

export class FieldBuilder<T, K extends DeepKeyOf<T>> {
  constructor(
    private builder: QueryBuilder<T>,
    private field: K,
    private logical?: 'and' | 'or'
  ) {}

  private addCondition(condition: any): QueryBuilder<T> {
    this.builder._addCondition(this.field, condition, this.logical);
    return this.builder;
  }

  equals(value: PathValue<T, K>): QueryBuilder<T> {
    return this.addCondition(value);
  }

  eq(value: PathValue<T, K>): QueryBuilder<T> {
    return this.addCondition({ $eq: value });
  }

  notEquals(value: PathValue<T, K>): QueryBuilder<T> {
    return this.addCondition({ $ne: value });
  }

  ne(value: PathValue<T, K>): QueryBuilder<T> {
    return this.addCondition({ $ne: value });
  }

  greaterThan(value: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never): QueryBuilder<T> {
    return this.addCondition({ $gt: value });
  }

  gt(value: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never): QueryBuilder<T> {
    return this.addCondition({ $gt: value });
  }

  greaterThanOrEqual(value: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never): QueryBuilder<T> {
    return this.addCondition({ $gte: value });
  }

  gte(value: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never): QueryBuilder<T> {
    return this.addCondition({ $gte: value });
  }

  lessThan(value: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never): QueryBuilder<T> {
    return this.addCondition({ $lt: value });
  }

  lt(value: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never): QueryBuilder<T> {
    return this.addCondition({ $lt: value });
  }

  lessThanOrEqual(value: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never): QueryBuilder<T> {
    return this.addCondition({ $lte: value });
  }

  lte(value: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never): QueryBuilder<T> {
    return this.addCondition({ $lte: value });
  }

  in(values: PathValue<T, K> extends ReadonlyArray<infer U> ? U[] : PathValue<T, K>[]): QueryBuilder<T> {
    return this.addCondition({ $in: values });
  }

  notIn(values: PathValue<T, K> extends ReadonlyArray<infer U> ? U[] : PathValue<T, K>[]): QueryBuilder<T> {
    return this.addCondition({ $nin: values });
  }

  nin(values: PathValue<T, K> extends ReadonlyArray<infer U> ? U[] : PathValue<T, K>[]): QueryBuilder<T> {
    return this.addCondition({ $nin: values });
  }

  contains(value: PathValue<T, K> extends ReadonlyArray<infer U> ? U : never): QueryBuilder<T> {
    return this.addCondition(value);
  }

  regex(pattern: PathValue<T, K> extends string ? RegExp | string : never): QueryBuilder<T> {
    return this.addCondition({ $regex: pattern });
  }

  matches(pattern: PathValue<T, K> extends string ? RegExp | string : never): QueryBuilder<T> {
    return this.addCondition({ $regex: pattern });
  }

  exists(value: boolean = true): QueryBuilder<T> {
    return this.addCondition({ $exists: value });
  }

  size(value: PathValue<T, K> extends ReadonlyArray<unknown> ? number : never): QueryBuilder<T> {
    return this.addCondition({ $size: value });
  }

  all(values: PathValue<T, K> extends ReadonlyArray<infer U> ? U[] : never): QueryBuilder<T> {
    return this.addCondition({ $all: values });
  }

  elemMatch(query: PathValue<T, K> extends ReadonlyArray<infer U> ? SafeSiftQuery<U> : never): QueryBuilder<T> {
    return this.addCondition({ $elemMatch: query });
  }

  between(
    min: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never,
    max: PathValue<T, K> extends string | number | Date ? PathValue<T, K> : never
  ): QueryBuilder<T> {
    return this.addCondition({ $gte: min, $lte: max });
  }
}

export function query<T>(): QueryBuilder<T> {
  return new QueryBuilder<T>();
}