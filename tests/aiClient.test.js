import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPythonCode } from '../src/lib/aiClient.js';

test('extractPythonCode reads fenced Python content', () => {
  assert.equal(
    extractPythonCode('说明\n```python\nprint("hello")\n```\n'),
    'print("hello")'
  );
});

test('extractPythonCode keeps plain code intact', () => {
  assert.equal(extractPythonCode('  print(123)  '), 'print(123)');
});

