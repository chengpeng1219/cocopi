import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TELEMETRY_MARKER,
  FILE_LIST_MARKER,
  buildTelemetryUsbCommand,
  parseTelemetryOutput,
  parseFileListOutput
} from '../src/lib/deviceProbes.js';

test('parseTelemetryOutput parses real metrics and keeps unavailable NPU as null', () => {
  const output = [
    'boot log',
    `${TELEMETRY_MARKER}{"cpu":37,"npu":null,"ram":52,"temp":48.3}`,
    'after log'
  ].join('\n');
  assert.deepEqual(parseTelemetryOutput(output), {
    cpu: 37,
    npu: null,
    ram: 52,
    temp: 48.3
  });
});

test('parseTelemetryOutput clamps invalid percentages', () => {
  const output = `${TELEMETRY_MARKER}{"cpu":140,"npu":"","ram":-4,"temp":0}`;
  assert.deepEqual(parseTelemetryOutput(output), {
    cpu: 100,
    npu: null,
    ram: 0,
    temp: 0
  });
});

test('parseFileListOutput returns safe file metadata', () => {
  const output = `${FILE_LIST_MARKER}[{"name":"main.py","size":128,"mtime":1700000000},{"bad":true}]`;
  assert.deepEqual(parseFileListOutput(output), [
    { name: 'main.py', size: 128, mtime: 1700000000 }
  ]);
});

test('buildTelemetryUsbCommand wraps Python in a base64 launcher', () => {
  const command = buildTelemetryUsbCommand();
  assert.match(command, /^python3 -c "import base64;exec\(base64\.b64decode\('/);
  assert.match(command, /'\)\)"$/);
  assert.ok(command.length > 100);
});

