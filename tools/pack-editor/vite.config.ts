import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { localApiPlugin } from './src/server/local-api-plugin.js';

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5174,
  },
});
