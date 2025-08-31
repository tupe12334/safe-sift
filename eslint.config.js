// @ts-check
import config from "eslint-config-agent";

export default [
  ...config,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
