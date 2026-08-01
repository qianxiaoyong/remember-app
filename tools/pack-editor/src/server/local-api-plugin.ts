import type { Plugin } from 'vite';
import { createLocalApiMiddleware } from './routes.js';

export function localApiPlugin(): Plugin {
  return {
    name: 'pack-editor-local-api',
    configureServer(server) {
      server.middlewares.use(createLocalApiMiddleware());
    },
  };
}
