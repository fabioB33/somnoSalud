import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * Vite config Conversor PSG (Sprint 19).
 *
 * - puerto 5173 (default Vite). webapp-somnosalud usa 3000 → coexisten.
 * - alias '@/' para src.
 * - excluye pdfjs-dist del optimizeDeps porque ya viene pre-bundled.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    // pdfjs-dist tiene worker que Vite maneja mejor sin pre-bundle
    exclude: ['pdfjs-dist'],
  },
});
