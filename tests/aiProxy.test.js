import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, getRateLimitKey } from '../server/aiProxy.js';

function createRequest(remoteAddress, headers = {}) {
  return {
    socket: { remoteAddress },
    headers
  };
}

test('getRateLimitKey trusts X-Real-IP from a loopback Nginx proxy', () => {
  const request = createRequest('::ffff:127.0.0.1', {
    'x-real-ip': '203.0.113.10'
  });
  assert.equal(getRateLimitKey(request, {}), '203.0.113.10');
});

test('getRateLimitKey ignores forwarded headers from an untrusted remote peer', () => {
  const request = createRequest('198.51.100.8', {
    'x-real-ip': '203.0.113.10'
  });
  assert.equal(getRateLimitKey(request, {}), '198.51.100.8');
});

test('rate limits are isolated per forwarded client IP', () => {
  const env = { AI_TRUST_PROXY: '1' };
  const firstClient = createRequest('127.0.0.1', {
    'x-real-ip': '203.0.113.20'
  });
  const secondClient = createRequest('127.0.0.1', {
    'x-real-ip': '203.0.113.21'
  });

  for (let index = 0; index < 20; index += 1) {
    checkRateLimit(firstClient, env);
  }
  assert.throws(() => checkRateLimit(firstClient, env), /请求过于频繁/);
  assert.doesNotThrow(() => checkRateLimit(secondClient, env));
});
