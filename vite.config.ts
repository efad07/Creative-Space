import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: './' makes the paths relative.
  // This fixes the "White Screen" on InfinityFree, GitHub Pages, and all other hosting.
  base: './', 
  build: {
    outDir: 'dist',
  },
});