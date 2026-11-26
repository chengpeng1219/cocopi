import http from 'node:http';
import { loadLocalEnv } from './loadEnv.js';
import { handleAiRequest } from './aiProxy.js';
import { handleDeviceSshRequest } from './deviceSsh.js';
import { handleDebugLogRequest } from './debugLog.js';

loadLocalEnv();

const host = process.env.AI_PROXY_HOST || '127.0.0.1';
const port = Number(process.env.AI_PROXY_PORT || 8787);

const server = http.createServer((req, res) => {
  if (String(req.url || '').startsWith('/api/debug-log')) {
    handleDebugLogRequest(req, res).catch((error) => {
      console.error('[debug-log] unhandled error', error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    });
    return;
  }

  if (String(req.url || '').startsWith('/api/device/ssh')) {
    handleDeviceSshRequest(req, res).catch((error) => {
      console.error('[device-ssh] unhandled error', error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    });
    return;
  }

  handleAiRequest(req, res).catch((error) => {
    console.error('[ai-proxy] unhandled error', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  });
});

server.listen(port, host, () => {
  console.log(`[cocopi-server] listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`[ai-proxy] received ${signal}, shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

