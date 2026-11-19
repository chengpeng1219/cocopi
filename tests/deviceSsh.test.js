import test from 'node:test';
import assert from 'node:assert/strict';
import { handleDeviceSshRequest } from '../server/deviceSsh.js';

function makeRequest({ url = '/exec', method = 'POST', body = null } = {}) {
  const chunks = body == null ? [] : [Buffer.from(JSON.stringify(body))];
  return {
    url,
    method,
    headers: {},
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk;
    }
  };
}

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(value = '') {
      this.body = String(value);
    }
  };
}

test('device SSH proxy rejects public addresses', async () => {
  const req = makeRequest({
    body: {
      host: '8.8.8.8',
      username: 'root',
      password: 'test',
      command: 'hostname'
    }
  });
  const res = makeResponse();

  await handleDeviceSshRequest(req, res, { env: {} });

  assert.equal(res.statusCode, 400);
  assert.match(JSON.parse(res.body).error, /私有 IPv4/);
});

test('device SSH proxy requires a password when no server default exists', async () => {
  const req = makeRequest({
    body: {
      host: '192.168.0.64',
      username: 'root',
      command: 'hostname'
    }
  });
  const res = makeResponse();

  await handleDeviceSshRequest(req, res, { env: {} });

  assert.equal(res.statusCode, 400);
  assert.match(JSON.parse(res.body).error, /密码/);
});

test('device SSH proxy only accepts POST requests', async () => {
  const req = makeRequest({ method: 'GET' });
  const res = makeResponse();

  await handleDeviceSshRequest(req, res, { env: {} });

  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST');
});
