import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    globals: true,
    fileParallelism: false,
    hookTimeout: 30000, // 30 seconds for hooks
    testTimeout: 30000, // 30 seconds for tests
    sequence: {
      concurrent: false,
    },
  },
});
