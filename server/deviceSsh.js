import ssh2 from 'ssh2';

const { Client } = ssh2;

const DEFAULT_PORT = 22;
const DEFAULT_USER = 'root';
const MAX_BODY_BYTES = 512 * 1024;
const MAX_COMMAND_LENGTH = 400 * 1024;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

class RequestError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new RequestError(413, 'SSH 请求内容过大');
    }
    chunks.push(chunk);
  }

  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (_) {
    throw new RequestError(400, '请求内容不是有效的 JSON');
  }
}

function parsePort(value) {
  const port = Number(value || DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new RequestError(400, 'SSH 端口需为 1 ~ 65535 之间的整数');
  }
  return port;
}

function parsePrivateHost(value) {
  const host = String(value || '').trim();
  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) {
    throw new RequestError(400, 'SSH 地址必须是 IPv4 地址');
  }

  const octets = match.slice(1).map(Number);
  if (octets.some((part) => part < 0 || part > 255)) {
    throw new RequestError(400, 'SSH 地址不是合法的 IPv4 地址');
  }

  const [first, second] = octets;
  const isPrivate =
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254);

  if (!isPrivate) {
    throw new RequestError(400, '仅允许通过 SSH 连接局域网私有 IPv4 地址');
  }
  return host;
}

function friendlySshError(error) {
  const message = String(error?.message || error || 'SSH 连接失败');
  if (/authentication methods failed|authentication failure|permission denied/i.test(message)) {
    return 'SSH 用户名或密码错误';
  }
  if (/timed out|timeout/i.test(message)) {
    return 'SSH 连接超时，请确认设备已开机且与服务端处于同一网络';
  }
  if (/ECONNREFUSED|connection refused/i.test(message)) {
    return '设备未开放 SSH 端口';
  }
  if (/EHOSTUNREACH|ENETUNREACH|no route/i.test(message)) {
    return '无法访问设备 SSH 地址';
  }
  return message;
}

function runSshCommand({ host, port, username, password, command, timeoutMs }) {
  return new Promise((resolve) => {
    const client = new Client();
    let settled = false;
    let stdout = '';
    let stderr = '';
    let outputTruncated = false;

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      client.end();
      resolve(payload);
    };

    const appendOutput = (current, chunk) => {
      const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk || '');
      const combined = current + text;
      if (Buffer.byteLength(combined, 'utf8') <= MAX_OUTPUT_BYTES) {
        return combined;
      }
      outputTruncated = true;
      return combined.slice(-MAX_OUTPUT_BYTES);
    };

    const timer = setTimeout(() => {
      finish({
        ok: false,
        code: null,
        stdout,
        stderr,
        error: 'SSH 命令执行超时',
        outputTruncated
      });
    }, timeoutMs);

    client.on('ready', () => {
      client.exec(command, (error, stream) => {
        if (error) {
          finish({
            ok: false,
            code: null,
            stdout,
            stderr,
            error: friendlySshError(error),
            outputTruncated
          });
          return;
        }

        stream.on('data', (chunk) => {
          stdout = appendOutput(stdout, chunk);
        });
        stream.stderr.on('data', (chunk) => {
          stderr = appendOutput(stderr, chunk);
        });
        stream.on('close', (code) => {
          finish({
            ok: code === 0,
            code,
            stdout,
            stderr,
            error: code === 0 ? '' : `SSH 命令退出码 ${code}`,
            outputTruncated
          });
        });
      });
    });

    client.on('error', (error) => {
      finish({
        ok: false,
        code: null,
        stdout,
        stderr,
        error: friendlySshError(error),
        outputTruncated
      });
    });

    client.connect({
      host,
      port,
      username,
      password,
      readyTimeout: 8_000,
      keepaliveInterval: 5_000,
      keepaliveCountMax: 2
    });
  });
}

function getRequestPath(req) {
  try {
    return new URL(req.url || '/', 'http://localhost').pathname;
  } catch (_) {
    return req.url || '/';
  }
}

export async function handleDeviceSshRequest(req, res, { env = process.env } = {}) {
  const pathname = getRequestPath(req);
  const isHealth = pathname === '/health' || pathname === '/api/device/ssh/health';
  const isExec = pathname === '/exec' || pathname === '/api/device/ssh/exec';
  if (!isHealth && !isExec) {
    sendJson(res, 404, { error: 'Not Found' });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const host = parsePrivateHost(body.host);
    const port = parsePort(body.port);
    const username = String(body.username || env.COCOPI_SSH_USER || DEFAULT_USER).trim();
    const password = String(body.password || env.COCOPI_SSH_PASSWORD || '');
    if (!username) {
      throw new RequestError(400, '请输入 SSH 用户名');
    }
    if (!password) {
      throw new RequestError(400, '请输入 SSH 密码，或在服务端配置 COCOPI_SSH_PASSWORD');
    }

    const command = isHealth
      ? 'printf "__COCOPI_SSH_OK__\\n"; hostname; uname -a'
      : String(body.command || '');
    if (!command.trim()) {
      throw new RequestError(400, 'SSH 命令不能为空');
    }
    if (command.length > MAX_COMMAND_LENGTH) {
      throw new RequestError(413, 'SSH 命令过长');
    }

    const timeoutMs = Math.min(
      120_000,
      Math.max(5_000, Number(body.timeoutMs) || (isHealth ? 12_000 : 30_000))
    );
    const result = await runSshCommand({
      host,
      port,
      username,
      password,
      command,
      timeoutMs
    });
    sendJson(res, 200, result);
  } catch (error) {
    const statusCode = error instanceof RequestError ? error.statusCode : 500;
    if (statusCode === 500) {
      console.error('[device-ssh] request failed', error?.message || error);
    }
    sendJson(res, statusCode, {
      ok: false,
      error: statusCode === 500 ? 'SSH 代理请求失败' : error.message
    });
  }
}
