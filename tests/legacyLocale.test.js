import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLegacyLocale } from '../src/lib/legacyLocale.js';

test('legacy locale scripts can write messages on an immutable Blockly module', () => {
  const messages = {};
  const blockly = Object.freeze({ Msg: messages });
  const categories = evaluateLegacyLocale(
    `
      Blockly.Msg.TEST_LABEL = "测试积木";
      Blockly.Categories = {};
      Blockly.Categories.motion = "motion";
    `,
    blockly
  );

  assert.equal(messages.TEST_LABEL, '测试积木');
  assert.equal(categories.motion, 'motion');
});
