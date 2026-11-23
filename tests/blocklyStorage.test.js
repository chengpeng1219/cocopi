import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadIndexedWorkspaceState,
  readLocalWorkspaceState,
  readWorkspaceStorageMode,
  saveWorkspaceState
} from '../src/lib/blocklyStorage.js';

function installLocalStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    }
  };
  return values;
}

test('blockly storage migrates local drafts and writes local fallback', async () => {
  installLocalStorage({
    'cocopi-blockly-workspace-v1': JSON.stringify({ blocks: { blocks: [] } }),
    'cocopi-blockly-storage-mode': 'local'
  });

  assert.deepEqual(readLocalWorkspaceState(), { blocks: { blocks: [] } });
  const result = await saveWorkspaceState({ blocks: { blocks: [{ type: 'text' }] } });
  assert.equal(result.ok, true);
  assert.equal(result.storage, 'local');
  assert.equal(readWorkspaceStorageMode(), 'local');
});

test('blockly storage can recover a mirrored draft after indexed mode is set', async () => {
  installLocalStorage({
    'cocopi-blockly-workspace-v1': JSON.stringify({ blocks: { blocks: [{ type: 'math_number' }] } }),
    'cocopi-blockly-storage-mode': 'indexeddb'
  });

  assert.equal(readLocalWorkspaceState(), null);
  assert.deepEqual(await loadIndexedWorkspaceState(), {
    blocks: { blocks: [{ type: 'math_number' }] }
  });
});
