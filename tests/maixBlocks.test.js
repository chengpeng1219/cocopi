import test from 'node:test';
import assert from 'node:assert/strict';
import * as Blockly from 'blockly';
import {
  createStarterWorkspaceState,
  generateMaixPython,
  getMaixToolbox
} from '../src/lib/maixBlocks.js';

test('starter block program generates runnable MaixCAM2 Python', () => {
  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(createStarterWorkspaceState(), workspace);
    const code = generateMaixPython(workspace);

    assert.match(code, /from maix import app, camera, display, image, touchscreen/);
    assert.match(code, /cam = camera\.Camera\(\)/);
    assert.match(code, /disp = display\.Display\(\)/);
    assert.match(code, /while not app\.need_exit\(\):/);
    assert.match(code, /\[APP_READY\]/);
    assert.doesNotMatch(code, /while True/);
    assert.doesNotMatch(code, /\/dev\/fb/);
  } finally {
    workspace.dispose();
  }
});

test('empty Blockly workspace produces no Python preview', () => {
  const workspace = new Blockly.Workspace();
  try {
    assert.equal(generateMaixPython(workspace), '');
  } finally {
    workspace.dispose();
  }
});

test('Blockly toolbox and starter text support English and Hong Kong Chinese', () => {
  const english = getMaixToolbox('en');
  const traditional = getMaixToolbox('zh-hant');

  assert.equal(english.contents[0].name, 'Program');
  assert.equal(traditional.contents[0].name, '程式');
  assert.match(
    JSON.stringify(createStarterWorkspaceState('en')),
    /MaixCAM2 is ready/
  );
  assert.match(
    JSON.stringify(createStarterWorkspaceState('zh-hant')),
    /MaixCAM2 已就緒/
  );
});
