import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleAiRequest } from './server/aiProxy.js';
import { handleDeviceSshRequest } from './server/deviceSsh.js';

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
      server.middlewares.use('/api/device/ssh', (req, res) => {
        handleDeviceSshRequest(req, res, { env }).catch((error) => {
          console.error('[device-ssh] dev middleware error', error);
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
      open: true,
      watch: {
        ignored: ['**/.maixpy/**']
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('maixcam2-block-kit') || id.includes('maixcam2Kit')) {
              return 'maixcam2-kit';
            }
            if (id.includes('/node_modules/blockly/')) return 'blockly';
            if (id.includes('/node_modules/three/')) return 'three';
            if (id.includes('/node_modules/@yume-chan/')) return 'webadb';
            if (id.includes('/node_modules/react')) return 'react-vendor';
          }
        }
      }
    }
  };
});
