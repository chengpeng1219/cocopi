import test from 'node:test';
import assert from 'node:assert/strict';
import { USAGE_GUIDE_CONTENT } from '../src/data/usageGuideContent.js';

test('usage guide content is complete in every supported language', () => {
  for (const language of ['zh-hans', 'zh-hant', 'en']) {
    const content = USAGE_GUIDE_CONTENT[language];
    assert.ok(content, `missing language: ${language}`);
    assert.equal(content.intro.highlights.length, 4);
    assert.equal(content.quickStart.steps.length, 5);
    assert.equal(content.ports.groups.length, 4);
    assert.equal(content.website.steps.length, 6);
    assert.equal(content.faq.items.length, 5);
    assert.ok(content.safety.items.length >= 4);
    for (const key of ['intro', 'hardware', 'quickStart', 'website', 'faq']) {
      assert.ok(content.nav[key], `${language} missing nav label: ${key}`);
    }
  }
});
