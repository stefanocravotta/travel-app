import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// `vitest/config` re-exports Vite's `defineConfig` with the extra `test` key.
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // `@/x` → `src/x`, same alias as `paths` in tsconfig.app.json.
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Vendor chunks: large, rarely-changing libraries get their own files,
        // so the browser keeps them cached across app deploys and no single
        // chunk exceeds Vite's 500 kB warning. They are still loaded at startup
        // (auth and routing are needed immediately); this is about caching and
        // chunk size, not about loading less.
        codeSplitting: {
          groups: [
            {
              name: 'vendor-supabase',
              test: /node_modules[\\/]@supabase[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  // https://vitest.dev/config/
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
