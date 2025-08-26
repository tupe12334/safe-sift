export type Primitive = string | number | boolean | Date | null | undefined;

export type DeepKeyOf<T> = T extends Primitive
  ? never
  : T extends ReadonlyArray<infer U>
  ? DeepKeyOf<U>
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends Primitive
          ? `${K}`
          : T[K] extends ReadonlyArray<unknown>
          ? `${K}` | `${K}.${DeepKeyOf<T[K][number]>}`
          : `${K}` | `${K}.${DeepKeyOf<T[K]>}`
        : never;
    }[keyof T]
  : never;

export type DeepValueOf<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends `${infer P}.${infer S}`
  ? P extends keyof T
    ? DeepValueOf<T[P], S>
    : never
  : never;

export type ComparisonOperators<T> = {
  $eq?: T;
  $ne?: T;
  $gt?: T extends string | number | Date ? T : never;
  $gte?: T extends string | number | Date ? T : never;
  $lt?: T extends string | number | Date ? T : never;
  $lte?: T extends string | number | Date ? T : never;
  $in?: T extends ReadonlyArray<infer U> ? U[] : T[];
  $nin?: T extends ReadonlyArray<infer U> ? U[] : T[];
  $regex?: T extends string ? RegExp | string : never;
  $options?: T extends string ? string : never;
  $exists?: boolean;
  $type?: string;
  $size?: T extends ReadonlyArray<unknown> ? number : never;
};

export type LogicalOperators<T> = {
  $and?: SafeSiftQuery<T>[];
  $or?: SafeSiftQuery<T>[];
  $nor?: SafeSiftQuery<T>[];
  $not?: SafeSiftQuery<T>;
};

export type ArrayOperators<T> = T extends ReadonlyArray<infer U>
  ? {
      $all?: U[];
      $elemMatch?: SafeSiftQuery<U>;
    }
  : never;

export type FieldQuery<T> = ComparisonOperators<T> | ArrayOperators<T> | T | (T extends ReadonlyArray<infer U> ? U : never);

export type SafeSiftQuery<T> = LogicalOperators<T> & {
  [K in keyof T]?: FieldQuery<T[K]>;
} & {
  [K in DeepKeyOf<T>]?: FieldQuery<DeepValueOf<T, K>>;
};