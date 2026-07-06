import path from 'node:path'
import { configDefaults, defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // mte.jialin00.com serves at root
  plugins: [vue(), tailwindcss(), Icons({ compiler: 'vue3' })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Playwright specs live in e2e/ and must run only under `playwright test`,
    // never be picked up by Vitest (they import @playwright/test).
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
