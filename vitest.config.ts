/**
 * @fileoverview Vitest configuration for SafeSift project testing.
 * 
 * This configuration file sets up Vitest for comprehensive testing of the SafeSift library.
 * It includes test discovery, coverage reporting, and environment setup optimized for
 * Node.js TypeScript testing.
 * 
 * Key configurations:
 * - Node.js test environment for server-side testing
 * - TypeScript test file discovery in __tests__ directories
 * - Comprehensive code coverage reporting
 * - Multiple coverage output formats (text, lcov, html)
 * 
 * @see {@link https://vitest.dev/config/} Vitest Configuration Documentation
 */

import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for SafeSift library testing.
 * 
 * Configures the testing framework with TypeScript support, coverage reporting,
 * and appropriate test discovery patterns for the SafeSift project structure.
 * 
 * @returns Vitest configuration object
 */
export default defineConfig({
  test: {
    /** Use Node.js environment for testing (appropriate for library code) */
    environment: 'node',
    /** Include pattern for test file discovery */
    include: ['**/__tests__/**/*.test.ts'],
    /** Code coverage configuration */
    coverage: {
      /** Include TypeScript source files for coverage analysis */
      include: ['src/**/*.ts'],
      /** Exclude TypeScript declaration files from coverage */
      exclude: ['src/**/*.d.ts'],
      /** Generate multiple coverage report formats */
      reporter: ['text', 'lcov', 'html'],
      /** Directory for coverage reports */
      reportsDirectory: 'coverage',
    },
  },
});