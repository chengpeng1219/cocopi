import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { partitionNestedCategoryBlocks } from '../src/lib/maixcam2Groups.js';

const toolbox = JSON.parse(
  fs.readFileSync('maixcam2-block-kit/toolbox.json', 'utf8')
);

test('nested categories assign every hardware, media and AI block exactly once', () => {
  for (const [parentId, expectedCount] of [
    ['catAI', 48],
    ['ExtendedFunction', 28],
    ['AI', 148]
  ]) {
    const category = toolbox.categories.find((item) => item.id === parentId);
    const groups = partitionNestedCategoryBlocks(
      parentId,
      category.blocks,
      'zh-hans'
    );
    const assigned = groups.flatMap((group) => group.blocks);
    assert.equal(assigned.length, expectedCount);
    assert.equal(new Set(assigned).size, expectedCount);
    assert.deepEqual(new Set(assigned), new Set(category.blocks));
  }
});

test('nested category labels follow the selected language', () => {
  const blocks = toolbox.categories.find((item) => item.id === 'AI').blocks;
  const simplified = partitionNestedCategoryBlocks('AI', blocks, 'zh-hans');
  const english = partitionNestedCategoryBlocks('AI', blocks, 'en');
  assert.deepEqual(
    simplified.map((group) => group.name),
    ['AI 视觉', 'LLM 大模型', '大模型（需 4G）', 'AI 听觉']
  );
  assert.equal(english[0].name, 'AI vision');
});
