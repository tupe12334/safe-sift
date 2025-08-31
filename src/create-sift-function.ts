import sift from "sift";
import { SafeSiftQuery } from "@types";
import type { SiftParameters } from "./safe-sift-types";

export function createSiftFunction<T>(query: SafeSiftQuery<T>) {
  const siftParams: SiftParameters = query;
  return sift(siftParams);
}