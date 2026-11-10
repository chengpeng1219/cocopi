import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWifiQrPayload, createWifiQrMatrix } from '../src/lib/qr.js';

test('buildWifiQrPayload escapes Wi-Fi special characters', () => {
  const payload = buildWifiQrPayload('Lab;5G', 'p:a\\ss"word,');
  assert.equal(payload, 'WIFI:T:WPA;S:Lab\\;5G;P:p\\:a\\\\ss\\"word\\,;;');
});

test('buildWifiQrPayload omits password for open networks', () => {
  assert.equal(
    buildWifiQrPayload('Guest', 'ignored', 'nopass'),
    'WIFI:T:nopass;S:Guest;;'
  );
});

test('createWifiQrMatrix returns a standards-based square matrix', () => {
  const matrix = createWifiQrMatrix('CocoPi-Lab', 'cocopi2026');
  assert.ok(matrix.size >= 21);
  assert.equal(matrix.modules.length, matrix.size);
  assert.equal(matrix.modules[0].length, matrix.size);
  assert.ok(matrix.modules.flat().some(Boolean));
});

