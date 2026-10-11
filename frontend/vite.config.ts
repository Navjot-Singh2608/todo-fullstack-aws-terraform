import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development every request to /api is forwarded to the FastAPI server,
// so the frontend never has to deal with CORS or hard-coded URLs.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
