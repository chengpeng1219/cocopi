import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEBUG_LOG_STORAGE_KEY,
  clearDebugLogs,
  getDebugLogEntries,
  getDebugLogExport,
  recordDebugLog,
  startDebugSession
} from '../src/lib/debugLog.js';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}

test('debug log entries persist with session and version metadata', () => {
  globalThis.localStorage = createMemoryStorage();
  clearDebugLogs();
  const session = startDebugSession({
    version: '9.9.9',
    userAgent: 'test-browser',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    entryUrl: 'http://localhost/'
  });
  recordDebugLog('连接设备', 'info');
  recordDebugLog('调试细节', 'debug');

  const entries = getDebugLogEntries();
  assert.equal(entries[0].type, 'session.start');
  assert.equal(entries[0].version, '9.9.9');
  assert.equal(entries.at(-1).message, '调试细节');
  assert.equal(entries.at(-1).sessionId, session.id);
  assert.ok(globalThis.localStorage.getItem(DEBUG_LOG_STORAGE_KEY));

  const exported = getDebugLogExport({ version: '9.9.9' });
  assert.equal(exported.version, '9.9.9');
  assert.equal(exported.entries.length, 3);
  delete globalThis.localStorage;
});
