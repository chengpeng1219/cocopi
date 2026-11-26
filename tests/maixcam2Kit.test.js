import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const kitRoot = path.resolve('maixcam2-block-kit');
const manifest = JSON.parse(
  fs.readFileSync(path.join(kitRoot, 'manifest.json'), 'utf8')
);
const toolbox = JSON.parse(
  fs.readFileSync(path.join(kitRoot, 'toolbox.json'), 'utf8')
);
const samples = JSON.parse(
  fs.readFileSync(path.join(kitRoot, 'samples/index.json'), 'utf8')
);

test('MaixCAM2 kit contains every declared block and runtime file', () => {
  for (const filename of manifest.blockFiles) {
    assert.equal(
      fs.existsSync(path.join(kitRoot, filename)),
      true,
      `missing block file: ${filename}`
    );
  }
  for (const filename of manifest.runtimeFiles) {
    assert.equal(
      fs.existsSync(path.join(kitRoot, filename)),
      true,
      `missing runtime file: ${filename}`
    );
  }
});

test('MaixCAM2 toolbox contains only allowed categories and block types', () => {
  const expectedCategories = [
    '逻辑',
    '循环',
    '数学运算',
    '变量',
    '文字',
    '列表',
    '字典',
    '元组',
    '集合',
    '函数',
    'Python',
    '时间',
    '串口打印',
    'MaixCAM2 设备',
    '媒体处理',
    'MaixCAM2 AI'
  ];
  const actualCategories = toolbox.categories.map((item) => item.name);
  assert.deepEqual(actualCategories, expectedCategories);
  assert.equal(new Set(toolbox.blockTypes).size, 354);
  assert.equal(manifest.toolboxBlockTypeCount, 354);
  assert.doesNotMatch(
    actualCategories.join(' '),
    /物联网|IoT|AIGC|扩展板|micro:bit|讯飞云/i
  );
});

test('all 52 MaixCAM2 examples exist and are indexed', () => {
  const indexedItems = samples.groups.flatMap((group) => group.items);
  assert.equal(samples.groups.length, 10);
  assert.equal(indexedItems.length, 52);
  for (const [, filename] of indexedItems) {
    assert.equal(
      fs.existsSync(path.join(kitRoot, 'samples', filename)),
      true,
      `missing sample: ${filename}`
    );
  }
});

test('every media asset referenced by migrated blocks is present', () => {
  const sourceFiles = manifest.blockFiles
    .filter(
      (filename) =>
        filename === 'blocks/ai.js' ||
        filename.includes('maixcam2_')
    )
    .map((filename) => path.join(kitRoot, filename))
    .concat(
      manifest.runtimeFiles
        .filter((filename) => filename.endsWith('.js'))
        .map((filename) => path.join(kitRoot, filename))
    );
  const assets = new Set();
  for (const filename of sourceFiles) {
    const source = fs.readFileSync(filename, 'utf8');
    for (const match of source.matchAll(/blockly\/media\/([A-Za-z0-9_./-]+)/g)) {
      assets.add(match[1]);
    }
  }
  for (const asset of assets) {
    assert.equal(
      fs.existsSync(path.resolve('public/maixcam2-block-kit/media', asset)),
      true,
      `missing media asset: ${asset}`
    );
  }
});

test('complete locale sources define the migrated Chinese block labels', () => {
  const source = fs.readFileSync(
    path.join(kitRoot, 'i18n/zh-hans.js'),
    'utf8'
  );
  const messages = {};
  new Function('Blockly', 'goog', source)(
    { Msg: messages, Categories: {} },
    { provide() {}, require() {} }
  );
  for (const key of [
    'ARD_TIME_DELAY',
    'ARD_TIME_MS',
    'ARD_TIME_DELAY_seconds',
    'maixcam2_touch_down',
    'maixcam2_touch_up',
    'maixcam2_pose_detect',
    'maixcam2_pose_count',
    'maixcam2_pose_list',
    'maixcam2_seg_init',
    'maixcam2_hand_detect',
    'maixcam2_obb_detect',
    'maixcam2_ocr_detect',
    'maixcam2_yworld_detect'
  ]) {
    assert.ok(messages[key], `missing Chinese block message: ${key}`);
  }
  assert.equal(messages.ARD_TIME_DELAY, '等待');
  assert.equal(messages.maixcam2_touch_down, '触摸刚按下？');
  assert.equal(messages.maixcam2_pose_detect, '检测人体关键点，图像源为:');
});
