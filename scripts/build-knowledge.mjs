import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = process.cwd();
const BASE_URL = 'https://wiki.sipeed.com';
const API_INDEX = `${BASE_URL}/maixpy/api/index.html`;
const EXAMPLES_DIR = path.join(ROOT, 'knowledge-source', 'examples');
const ERRORS_DIR = path.join(ROOT, 'knowledge-source', 'errors');
const OUTPUT_DIR = path.join(ROOT, 'server', 'knowledge');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'generated.json');

const CATEGORY_RULES = [
  ['audio', /(语音|音频|音量|录音|频谱|Melo|SenseVoice)/i],
  ['vision', /(识别|检测|关键点|姿态|手势|颜色分析|OCR|二维码)/i],
  ['touch', /(点击|长按|拖动|触摸)/i],
  ['camera', /(相机|摄像头)/i],
  ['display', /(屏幕|字体|文字|绘制|圆形|矩形|直线|图片)/i]
];

const TAG_RULES = [
  ['display', /display\.Display|disp\.show|draw_string|draw_rect|draw_circle|image\.load_font/i],
  ['camera', /camera\.Camera|cam\.read|set_resolution/i],
  ['image', /image\.Image|image\.Color|image\.FlipDir|draw_image/i],
  ['audio', /pyaudio|wave\.|audio\.|audio0|Mic|Speaker/i],
  ['touch', /touchscreen\.TouchScreen|_maixTouch|read\(\)/i],
  ['vision', /nn\.|YOLOv5|PoseEstimation|LinearSVC|OCR|detect\(/i],
  ['model', /\/root\/models\/|\.mud|model=/i],
  ['uart', /uart|UART/i],
  ['gpio', /gpio|GPIO/i],
  ['i2c', /i2c|I2C/i],
  ['ocr', /OCR|ocr/i],
  ['qrcode', /二维码|条形码|QRCode/i]
];

function inferCategory(title, code) {
  for (const [category, pattern] of CATEGORY_RULES) {
    if (pattern.test(title) || pattern.test(code)) return category;
  }
  return 'general';
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function tokenize(value) {
  const text = String(value || '');
  const ascii = text.toLowerCase().match(/[a-z_][a-z0-9_.-]{1,}/g) || [];
  const chinese = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const bigrams = [];
  for (const segment of chinese) {
    for (let index = 0; index < segment.length - 1; index += 1) {
      bigrams.push(segment.slice(index, index + 2));
    }
  }
  return unique([...ascii, ...chinese, ...bigrams]);
}

function extractImports(code) {
  return unique(
    [...code.matchAll(/^\s*(?:from\s+([a-zA-Z0-9_.]+)\s+import|import\s+([a-zA-Z0-9_.]+))/gm)]
      .map((match) => match[1] || match[2])
  );
}

function extractApis(code) {
  return unique(
    [...code.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)+)\s*\(/g)]
      .map((match) => match[1])
  ).slice(0, 40);
}

async function readExamples() {
  const entries = await fs.readdir(EXAMPLES_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.py'))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  return Promise.all(
    files.map(async (entry) => {
      const filename = entry.name;
      const title = filename.replace(/\.py$/i, '');
      const code = await fs.readFile(path.join(EXAMPLES_DIR, filename), 'utf8');
      const category = inferCategory(title, code);
      const imports = extractImports(code);
      const apis = extractApis(code);
      const tags = unique([
        category,
        ...filename.replace(/\.py$/i, '').split(/[、，,_\s-]+/),
        ...imports.map((item) => item.replace(/^maix\.?/, '') || 'maix'),
        ...TAG_RULES.filter(([, pattern]) => pattern.test(code)).map(([tag]) => tag)
      ]);

      return {
        id: `example:${filename}`,
        kind: 'example',
        title,
        category,
        tags,
        imports,
        apis,
        code,
        expected: `运行“${title}”样例后，设备应产生对应的屏幕、摄像头、识别或音频效果。`,
        source: `knowledge-source/examples/${filename}`
      };
    })
  );
}

async function readErrors() {
  try {
    const entries = await fs.readdir(ERRORS_DIR, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));
    const groups = await Promise.all(
      files.map(async (entry) => {
        const content = await fs.readFile(path.join(ERRORS_DIR, entry.name), 'utf8');
        return JSON.parse(content);
      })
    );
    return groups.flat().map((item) => ({
      ...item,
      kind: 'error',
      tags: unique([item.category, ...(item.patterns || []), ...tokenize(item.cause || '')])
    }));
  } catch (_) {
    return [];
  }
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CocoPiPortalKnowledgeBuilder/1.0'
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  return response.text();
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractApiChunks(html, url) {
  const $ = cheerio.load(html);
  const article = $('#article_content');
  if (!article.length) return [];

  const title = normalizeText($('#article_title h1').first().text()) || url;
  const modules = article
    .find('table a[href*="/maix/"]')
    .map((_, element) => normalizeText($(element).text()))
    .get();
  const pageModule =
    new URL(url).pathname
      .replace('/maixpy/api/', '')
      .replace(/\.html$/, '')
      .replaceAll('/', '.') || 'api';
  const chunks = [];
  let heading = title;
  let buffer = [];
  let bufferLength = 0;

  const flush = () => {
    const content = normalizeText(buffer.join('\n'));
    if (content.length >= 40) {
      chunks.push({
        id: `api:${pageModule}:${chunks.length + 1}`,
        kind: 'api',
        title,
        heading,
        category: pageModule.split('.')[1] || 'api',
        modules: unique([pageModule, ...modules]),
        tags: tokenize(`${title} ${heading} ${content}`).slice(0, 80),
        content,
        source: url
      });
    }
    buffer = [];
    bufferLength = 0;
  };

  article.find('h1,h2,h3,h4,p,pre,table,ul,ol').each((_, element) => {
    const node = $(element);
    const tag = element.tagName.toLowerCase();
    if (/^h[1-4]$/.test(tag)) {
      flush();
      heading = normalizeText(node.text()) || title;
      return;
    }

    const text =
      tag === 'pre'
        ? `\`\`\`python\n${normalizeText(node.text())}\n\`\`\``
        : normalizeText(node.text());
    if (!text) return;

    if (bufferLength + text.length > 1800 && bufferLength > 0) {
      flush();
    }
    buffer.push(text);
    bufferLength += text.length;
  });
  flush();
  return chunks;
}

async function crawlApiDocs() {
  const indexHtml = await fetchHtml(API_INDEX);
  const $ = cheerio.load(indexHtml);
  const urls = unique(
    $('#sidebar a[href^="/maixpy/api/"]')
      .map((_, element) => new URL($(element).attr('href'), BASE_URL).href)
      .get()
      .concat(API_INDEX)
  );

  const chunks = [];
  const concurrency = 5;
  let index = 0;

  async function worker() {
    while (index < urls.length) {
      const current = urls[index];
      index += 1;
      try {
        const html = await fetchHtml(current);
        chunks.push(...extractApiChunks(html, current));
        console.log(`[knowledge] ${chunks.length} chunks <- ${current}`);
      } catch (error) {
        console.warn(`[knowledge] skipped ${current}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return chunks;
}

const [examples, errors, apiChunks] = await Promise.all([
  readExamples(),
  readErrors(),
  crawlApiDocs()
]);

await fs.mkdir(OUTPUT_DIR, { recursive: true });
await fs.writeFile(
  OUTPUT_FILE,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      apiSource: API_INDEX,
      examples,
      errors,
      api: apiChunks
    },
    null,
    2
  ),
  'utf8'
);

console.log(
  `[knowledge] wrote ${examples.length} examples, ${errors.length} errors, ${apiChunks.length} API chunks to ${OUTPUT_FILE}`
);
