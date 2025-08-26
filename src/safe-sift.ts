import sift from 'sift';
import { SafeSiftQuery } from './types';

export class SafeSift<T> {
  constructor(private readonly query: SafeSiftQuery<T>) {}

  test(obj: T): boolean {
    return sift(this.query as Parameters<typeof sift>[0])(obj);
  }

  filter(array: T[]): T[] {
    return array.filter(sift(this.query as Parameters<typeof sift>[0]));
  }

  find(array: T[]): T | undefined {
    return array.find(sift(this.query as Parameters<typeof sift>[0]));
  }

  findIndex(array: T[]): number {
    return array.findIndex(sift(this.query as Parameters<typeof sift>[0]));
  }

  some(array: T[]): boolean {
    return array.some(sift(this.query as Parameters<typeof sift>[0]));
  }

  every(array: T[]): boolean {
    return array.every(sift(this.query as Parameters<typeof sift>[0]));
  }

  count(array: T[]): number {
    return this.filter(array).length;
  }
}

export function createQuery<T>(query: SafeSiftQuery<T>): SafeSift<T> {
  return new SafeSift(query);
}

export function safeSift<T>(query: SafeSiftQuery<T>) {
  const siftFn = sift(query as Parameters<typeof sift>[0]);
  
  return {
    test: (obj: T): boolean => siftFn(obj),
    filter: (array: T[]): T[] => array.filter(siftFn),
    find: (array: T[]): T | undefined => array.find(siftFn),
    findIndex: (array: T[]): number => array.findIndex(siftFn),
    some: (array: T[]): boolean => array.some(siftFn),
    every: (array: T[]): boolean => array.every(siftFn),
    count: (array: T[]): number => array.filter(siftFn).length,
  };
}