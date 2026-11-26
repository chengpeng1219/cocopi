import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_BODY_BYTES = 256 * 1024;
const MAX_ENTRIES = 500;
const MAX_MESSAGE_LENGTH = 10_000;

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
      throw new RequestError(413, '调试日志请求内容过大');
    }
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new RequestError(400, '调试日志请求不是有效的 JSON');
  }
}

function safeSegment(value, fallback) {
  const cleaned = String(value || '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return cleaned || fallback;
}

function getDateStamp() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function normalizeEntry(entry, session) {
  return {
    savedAt: new Date().toISOString(),
    timestamp: String(entry?.timestamp || ''),
    sessionId: session.id,
    version: session.version || '',
    type: String(entry?.type || 'info').slice(0, 40),
    message: String(entry?.message ?? '').slice(0, MAX_MESSAGE_LENGTH)
  };
}

export async function handleDebugLogRequest(req, res, { env = process.env } = {}) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: '仅支持 POST' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const entries = Array.isArray(body.entries) ? body.entries : [];
    if (entries.length === 0 || entries.length > MAX_ENTRIES) {
      throw new RequestError(400, '调试日志条目数量无效');
    }

    const session = {
      id: safeSegment(body.session?.id, 'session'),
      version: safeSegment(body.session?.version, 'unknown'),
      startedAt: String(body.session?.startedAt || ''),
      userAgent: String(body.session?.userAgent || '').slice(0, 2000),
      language: String(body.session?.language || '').slice(0, 100),
      timezone: String(body.session?.timezone || '').slice(0, 100),
      entryUrl: String(body.session?.entryUrl || '').slice(0, 2000)
    };

    const logDir = path.resolve(
      env.COCOPI_DEBUG_LOG_DIR || path.join(process.cwd(), 'logs', 'debug')
    );
    const filename = `${getDateStamp()}_${session.id}.jsonl`;
    const target = path.join(logDir, filename);
    const lines = entries
      .map((entry) => JSON.stringify(normalizeEntry(entry, session)))
      .join('\n');

    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(target, `${lines}\n`, 'utf8');
    sendJson(res, 200, { saved: entries.length, file: filename });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    sendJson(res, statusCode, {
      error: statusCode === 500 ? '调试日志写入失败' : error.message
    });
  }
}
