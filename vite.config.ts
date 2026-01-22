import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths work on GitHub Pages subdirectories
  build: {
    outDir: 'dist',
  }
});