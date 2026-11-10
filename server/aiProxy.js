import { MAIXPY_AI_SYSTEM_PROMPT } from '../src/data/maixpy.js';
import {
  validateMaixPyCode,
  summarizeDeviceOutput
} from '../src/lib/maixpyValidator.js';
import { buildKnowledgeContext } from './knowledge/index.js';

const MAX_BODY_BYTES = 64 * 1024;
const MAX_PROMPT_LENGTH = 4000;
const MAX_PREVIOUS_CODE_LENGTH = 30_000;
const MAX_DEVICE_ERROR_LENGTH = 6000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_MAX_BUCKETS = 2048;
const rateBuckets = new Map();

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
      throw new RequestError(413, '请求内容过大');
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

function normalizeBaseUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch (_) {
    throw new RequestError(500, 'AI_BASE_URL 配置无效');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new RequestError(500, 'AI_BASE_URL 仅支持 HTTP 或 HTTPS');
  }
  return parsed.toString().replace(/\/+$/, '');
}

function getAiConfig(env) {
  return {
    apiKey: env.AI_API_KEY || env.VITE_AI_API_KEY || '',
    baseUrl: normalizeBaseUrl(
      env.AI_BASE_URL || env.VITE_AI_BASE_URL || 'https://api.deepseek.com/v1'
    ),
    model: env.AI_MODEL || env.VITE_AI_MODEL || 'deepseek-chat'
  };
}

function checkRateLimit(req) {
  const key = req.socket?.remoteAddress || 'unknown';
  const now = Date.now();

  if (rateBuckets.size > RATE_LIMIT_MAX_BUCKETS) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
        rateBuckets.delete(bucketKey);
      }
    }
  }

  const bucket = rateBuckets.get(key);

  if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return;
  }

  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
    throw new RequestError(429, '请求过于频繁，请稍后再试');
  }
}

function getRequestPath(req) {
  try {
    return new URL(req.url || '/', 'http://localhost').pathname;
  } catch (_) {
    return req.url || '/';
  }
}

function extractPythonCode(content) {
  const raw = String(content || '').trim();
  const match = raw.match(/```(?:python)?\s*([\s\S]*?)```/i);
  return (match ? match[1] : raw).trim();
}

async function requestCompletion(messages, config) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  let upstream;

  try {
    upstream = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        messages
      }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!upstream.ok) {
    const upstreamMessage = await upstream.text();
    console.error('[ai-proxy] upstream error', upstream.status, upstreamMessage.slice(0, 500));
    throw new RequestError(502, `AI 服务返回 HTTP ${upstream.status}`);
  }

  const data = await upstream.json();
  const content = data?.choices?.[0]?.message?.content || '';
  if (!content) {
    throw new RequestError(502, 'AI 服务未返回有效内容');
  }

  return {
    content,
    model: data?.model || config.model
  };
}

export async function handleAiRequest(req, res, { env = process.env } = {}) {
  const pathname = getRequestPath(req);

  if (pathname === '/health' || pathname === '/api/ai/health') {
    sendJson(res, 200, { ok: true, service: 'cocopi-ai-proxy' });
    return;
  }

  if (!pathname.endsWith('/chat')) {
    sendJson(res, 404, { error: 'Not Found' });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    checkRateLimit(req);
    const body = await readJsonBody(req);
    const prompt = String(body.prompt || '').trim();
    const previousCode = String(body.previousCode || '').slice(0, MAX_PREVIOUS_CODE_LENGTH);
    const deviceError = summarizeDeviceOutput(
      String(body.deviceError || '').slice(0, 20_000),
      MAX_DEVICE_ERROR_LENGTH
    );

    if (!prompt) {
      throw new RequestError(400, '请输入编程需求');
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new RequestError(400, `编程需求不能超过 ${MAX_PROMPT_LENGTH} 个字符`);
    }

    const config = getAiConfig(env);
    if (!config.apiKey) {
      throw new RequestError(503, '服务端尚未配置 AI_API_KEY');
    }

    const knowledge = buildKnowledgeContext(
      `${prompt}\n${deviceError}\n${previousCode.slice(0, 4000)}`,
      { maxLength: 16_000 }
    );

    const systemContent = [
      MAIXPY_AI_SYSTEM_PROMPT,
      '下面是检索到的官方 API 和设备实测样例。它们是优先依据；若与模型记忆冲突，以这些内容为准。',
      '返回完整 Python 代码，不要输出 Markdown 代码围栏。',
      '初始化成功后必须输出 [APP_READY] 启动标记。',
      '使用 display.Display()，禁止 /dev/fb*。摄像头程序必须使用 camera.Camera(640, 480)。',
      knowledge.context
    ]
      .filter(Boolean)
      .join('\n\n');

    const userContent = deviceError
      ? [
          `原始需求：${prompt}`,
          '当前代码：',
          previousCode,
          '设备运行错误摘要：',
          deviceError,
          '请根据知识库修复当前代码，只返回完整 Python 程序。'
        ].join('\n\n')
      : prompt;

    let result = await requestCompletion(
      [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent }
      ],
      config
    );

    let code = extractPythonCode(result.content);
    let validation = validateMaixPyCode(code);

    if (!validation.valid) {
      result = await requestCompletion(
        [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent },
          { role: 'assistant', content: code },
          {
            role: 'user',
            content: [
              '静态检查发现以下问题：',
              ...validation.errors.map((item) => `- ${item}`),
              '请修复全部问题，并返回完整可运行 Python 代码。'
            ].join('\n')
          }
        ],
        config
      );
      code = extractPythonCode(result.content);
      validation = validateMaixPyCode(code);
    }

    sendJson(res, 200, {
      content: result.content,
      code,
      model: result.model,
      validation,
      templates: knowledge.templates,
      references: knowledge.references
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      sendJson(res, 504, { error: 'AI 服务响应超时' });
      return;
    }
    const statusCode = error instanceof RequestError ? error.statusCode : 500;
    if (statusCode === 500) {
      console.error('[ai-proxy] request failed', error);
    }
    sendJson(res, statusCode, {
      error: statusCode === 500 ? 'AI 代理请求失败' : error.message
    });
  }
}

