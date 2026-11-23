import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getHardwareLabels,
  localizeHardwarePart
} from '../src/data/hardwarePartsI18n.js';
import { HARDWARE_PARTS } from '../src/data/hardwareParts.js';
import {
  translateSampleGroup,
  translateSampleTitle
} from '../src/data/sampleI18n.js';
import samples from '../maixcam2-block-kit/samples/index.json' with { type: 'json' };

const CJK_PATTERN = /[\u3400-\u9fff]/;

test('hardware overview labels are complete in English and traditional Chinese', () => {
  for (const language of ['en', 'zh-hant']) {
    const labels = getHardwareLabels(language);
    assert.equal(Object.keys(labels.cards).length, 6);
    assert.equal(Object.keys(labels.views).length, 6);
    assert.deepEqual(Object.keys(labels.features), ['real3d', 'click', 'views']);
    for (const part of Object.values(HARDWARE_PARTS)) {
      const localized = localizeHardwarePart(part, language);
      assert.ok(localized.name);
      assert.ok(localized.badge);
      assert.ok(localized.desc);
    }
  }
});

test('all sample groups and titles have English and traditional Chinese display text', () => {
  for (const group of samples.groups) {
    assert.doesNotMatch(translateSampleGroup(group.title, 'en'), CJK_PATTERN);
    for (const [title] of group.items) {
      assert.doesNotMatch(translateSampleTitle(title, 'en'), CJK_PATTERN);
    }
  }
});
