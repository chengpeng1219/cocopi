import fs from 'node:fs';

const knowledgePath = new URL('./generated.json', import.meta.url);
const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));

const CATEGORY_KEYWORDS = {
  display: ['屏幕', '显示', '文字', '字体', '绘图', '矩形', '圆形', '直线', '图片'],
  camera: ['摄像头', '相机', '预览', '拍照', '画面'],
  vision: ['识别', '检测', '模型', '关键点', '姿态', '手势', '二维码', '条形码', 'ocr', '颜色'],
  touch: ['触摸', '点击', '长按', '拖动'],
  audio: ['录音', '音频', '语音', '音量', '频谱', '播放', '识别'],
  uart: ['串口', 'uart'],
  i2c: ['i2c'],
  gpio: ['gpio', '引脚'],
  network: ['网络', 'wifi', 'http'],
  general: []
};

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function tokenize(value) {
  const text = String(value || '').toLowerCase();
  const ascii = text.match(/[a-z_][a-z0-9_.-]{1,}/g) || [];
  const chineseSegments = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const bigrams = [];
  for (const segment of chineseSegments) {
    for (let index = 0; index < segment.length - 1; index += 1) {
      bigrams.push(segment.slice(index, index + 2));
    }
  }
  return unique([...ascii, ...chineseSegments, ...bigrams]);
}

for (const example of knowledge.examples) {
  example.searchTokens = new Set([
    ...tokenize(example.title),
    ...(example.tags || []).flatMap(tokenize),
    ...(example.apis || []).flatMap(tokenize)
  ]);
  example.searchText = `${example.title}\n${example.expected}\n${example.code}`.toLowerCase();
}

for (const chunk of knowledge.api) {
  chunk.searchTokens = new Set([
    ...(chunk.tags || []).flatMap(tokenize),
    ...tokenize(chunk.heading || ''),
    ...tokenize(chunk.category || '')
  ]);
  chunk.searchText = `${chunk.title}\n${chunk.heading}\n${chunk.content}`.toLowerCase();
}

for (const error of knowledge.errors) {
  error.searchTokens = new Set([
    ...(error.tags || []).flatMap(tokenize),
    ...tokenize(error.cause || ''),
    ...tokenize(error.fix || '')
  ]);
  error.searchText = `${error.patterns?.join(' ') || ''}\n${error.cause}\n${error.fix}`.toLowerCase();
}

function scoreItem(item, tokens) {
  let score = 0;
  for (const token of tokens) {
    if (item.searchTokens?.has(token)) {
      score += token.length >= 4 ? 6 : 4;
    }
    if (item.searchText?.includes(token)) {
      score += token.length >= 4 ? 1.5 : 1;
    }
  }
  if (item.kind === 'example') score += 1.5;
  if (item.kind === 'error') score += 2;
  return score;
}

function inferCategories(query) {
  const lower = String(query || '').toLowerCase();
  return Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => lower.includes(keyword)))
    .map(([category]) => category);
}

export function retrieveKnowledge(query, limit = 10) {
  const tokens = tokenize(query);
  const categories = inferCategories(query);
  const boosts = (item) => (categories.includes(item.category) ? 8 : 0);

  const examples = knowledge.examples
    .map((item) => ({ ...item, score: scoreItem(item, tokens) + boosts(item) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(2, Math.ceil(limit / 3)));

  const api = knowledge.api
    .map((item) => ({ ...item, score: scoreItem(item, tokens) + boosts(item) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const errors = knowledge.errors
    .map((item) => ({ ...item, score: scoreItem(item, tokens) + boosts(item) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return { examples, api, errors, categories };
}

function formatExample(example) {
  return [
    `【可运行样例：${example.title}】`,
    `分类：${example.category}`,
    `来源：${example.source}`,
    '```python',
    example.code.trim(),
    '```'
  ].join('\n');
}

function formatApi(chunk) {
  return [
    `【官方 API：${chunk.title} / ${chunk.heading}】`,
    `模块：${(chunk.modules || []).join(', ')}`,
    `来源：${chunk.source}`,
    chunk.content.trim()
  ].join('\n');
}

function formatError(error) {
  return [
    `【常见错误：${error.id}】`,
    `特征：${(error.patterns || []).join(' | ')}`,
    `原因：${error.cause}`,
    `修复：${error.fix}`,
    `参考：${error.example}`
  ].join('\n');
}

export function buildKnowledgeContext(query, { maxLength = 16_000 } = {}) {
  const selected = retrieveKnowledge(query, 8);
  const blocks = [
    ...selected.examples.map(formatExample),
    ...selected.api.map(formatApi),
    ...selected.errors.map(formatError)
  ];

  let context = '';
  for (const block of blocks) {
    if (context.length + block.length > maxLength) break;
    context += `${context ? '\n\n' : ''}${block}`;
  }

  return {
    context,
    categories: selected.categories,
    references: [
      ...selected.examples.map((item) => item.id),
      ...selected.api.map((item) => item.id),
      ...selected.errors.map((item) => item.id)
    ],
    templates: selected.examples.map((item) => item.title)
  };
}

export function getKnowledgeStats() {
  return {
    generatedAt: knowledge.generatedAt,
    apiSource: knowledge.apiSource,
    examples: knowledge.examples.length,
    apiChunks: knowledge.api.length,
    errors: knowledge.errors.length
  };
}

export function getExampleById(id) {
  return knowledge.examples.find((item) => item.id === id || item.title === id) || null;
}

