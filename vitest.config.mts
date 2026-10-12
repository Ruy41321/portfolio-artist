import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts', 'tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    // Integration tests share one database: run files sequentially.
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
})
