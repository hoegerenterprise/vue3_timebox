import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: process.env.VITE_BASE_URL ?? '/',
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/github': {
        target: 'https://api.github.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/github/, ''),
        headers: {
          'Accept': 'application/vnd.github+json',
        },
      },
      '/api/gitlab': {
        target: 'https://gitlab.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gitlab/, '/api/v4'),
      },
    },
  },
})
