// @ts-check
import config from "@tupe12334/eslint-config";

export default [
  ...config,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error"
    }
  }
];
