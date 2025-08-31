import type { FindResult } from "./find-result";

export type SafeSiftReturnType<T> = {
  test: (obj: T) => boolean;
  filter: (array: T[]) => T[];
  find: (array: T[]) => FindResult<T>;
  findIndex: (array: T[]) => number;
  some: (array: T[]) => boolean;
  every: (array: T[]) => boolean;
  count: (array: T[]) => number;
};