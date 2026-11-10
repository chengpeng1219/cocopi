import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleAiRequest } from './server/aiProxy.js';

function cocopiAiProxyPlugin(env) {
  return {
    name: 'cocopi-ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai', (req, res) => {
        handleAiRequest(req, res, { env }).catch((error) => {
          console.error('[ai-proxy] dev middleware error', error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), cocopiAiProxyPlugin(env)],
    server: {
      port: 5173,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three', 'three/examples/jsm/controls/OrbitControls.js']
          }
        }
      }
    }
  };
});
