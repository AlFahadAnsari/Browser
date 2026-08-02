import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** A single `@/…` alias that resolves to `src/`, shared by all three build targets. */
const alias = { '@': resolve(__dirname, 'src') }

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      outDir: 'out/main',
      minify: 'esbuild',
      rollupOptions: {
        input: { main: resolve(__dirname, 'src/electron/main.ts') },
      },
    },
  },

  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      outDir: 'out/preload',
      minify: 'esbuild',
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'src/electron/preload.ts'),
          'website-preload': resolve(__dirname, 'src/electron/websitePreload.ts'),
        },
        output: { format: 'cjs', entryFileNames: '[name].js' },
      },
    },
  },

  renderer: {
    root: __dirname,
    plugins: [react(), tailwindcss()],
    resolve: { alias },
    build: {
      outDir: 'out/renderer',
      minify: 'esbuild',
      cssMinify: true,
      reportCompressedSize: false,
      rollupOptions: {
        input: { index: resolve(__dirname, 'index.html') },
      },
    },
  },
})
