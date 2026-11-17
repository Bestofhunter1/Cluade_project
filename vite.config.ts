import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// For GitHub Pages, set base to '/your-repo-name/'
// Replace 'techwarehouse-hr' with your actual GitHub repository name
const base = process.env.GITHUB_PAGES ? '/Cluade_project/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});