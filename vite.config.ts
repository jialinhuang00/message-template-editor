import path from 'node:path'
import { defineConfig } from 'vite'
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
})
