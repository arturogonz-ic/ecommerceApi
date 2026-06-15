import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/setup.js'],
    testTimeout: 30000,
    environment: 'node',
    env: {
      JWT_USER_SECRET: 'test_user_secret',
      JWT_ADMIN_SECRET: 'test_admin_secret',
    },
  },
});
