import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import svgLoader from 'vite-svg-loader';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/FlowTrack' : '/',
  
  plugins: [
    vue(),
    vueDevTools(),
    svgLoader(),
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/tests/**/*.test.{ts,js}'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: 'coverage',
      reporter: ['text', 'json', 'html'],
    },
  },
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
