import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { handleDebugLogRequest } from '../server/debugLog.js';

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(value) {
      this.body = value;
    }
  };
}

test('debug log endpoint appends browser events to a JSONL file', async (t) => {
  const logDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cocopi-debug-log-'));
  t.after(() => fs.rm(logDir, { recursive: true, force: true }));
  const payload = JSON.stringify({
    session: {
      id: 'session-1',
      version: '1.0.15',
      startedAt: '2026-11-23T09:00:00.000Z'
    },
    entries: [
      {
        timestamp: '2026-11-23T09:00:01.000Z',
        type: 'info',
        message: 'ADB connected'
      }
    ]
  });
  const req = Readable.from([Buffer.from(payload)]);
  req.method = 'POST';
  const res = createResponse();

  await handleDebugLogRequest(req, res, {
    env: { COCOPI_DEBUG_LOG_DIR: logDir }
  });

  assert.equal(res.statusCode, 200);
  const files = await fs.readdir(logDir);
  assert.equal(files.length, 1);
  const content = await fs.readFile(path.join(logDir, files[0]), 'utf8');
  const entry = JSON.parse(content.trim());
  assert.equal(entry.sessionId, 'session-1');
  assert.equal(entry.version, '1.0.15');
  assert.equal(entry.message, 'ADB connected');
});
