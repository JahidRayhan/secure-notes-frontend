import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: /api is proxied to the backend. Override with VITE_PROXY_TARGET.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: { '/api': process.env.VITE_PROXY_TARGET || 'http://localhost:4000' },
  },
}));
