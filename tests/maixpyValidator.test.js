import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_READY_MARKER,
  validateMaixPyCode,
  summarizeDeviceOutput
} from '../src/lib/maixpyValidator.js';
import { buildKnowledgeContext, getKnowledgeStats } from '../server/knowledge/index.js';

test('valid camera code passes static checks', () => {
  const code = `
from maix import app, camera, display

disp = display.Display()
cam = camera.Camera(640, 480)
print("${APP_READY_MARKER} camera ready")
while not app.need_exit():
    disp.show(cam.read())
`;
  const result = validateMaixPyCode(code);
  assert.equal(result.valid, true);
  assert.ok(result.tags.includes('display'));
  assert.ok(result.tags.includes('camera'));
});

test('validator rejects framebuffer APIs and missing initialization', () => {
  const result = validateMaixPyCode(`
from maix import display
disp = display.Display(device="/dev/fb0")
disp.show(image.Image(10, 10))
`);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.includes('/dev/fb')));
  assert.ok(result.errors.some((item) => item.includes('image')));
});

test('device output summary removes Maix multimedia noise', () => {
  const output = [
    '-- [I] [Maix Comm Protocol] listening on uart port',
    '[SAMPLE-VO] init fb0 done',
    'Traceback (most recent call last):',
    '  File "/root/user_latest_code.py", line 4, in <module>',
    'NameError: name display is not defined'
  ].join('\n');
  const summary = summarizeDeviceOutput(output);
  assert.match(summary, /Traceback/);
  assert.match(summary, /NameError/);
  assert.doesNotMatch(summary, /SAMPLE-VO/);
});

test('knowledge base retrieves camera example and official APIs', () => {
  const result = buildKnowledgeContext('摄像头实时预览并在屏幕显示画面');
  assert.ok(result.context.includes('相机图像预览'));
  assert.ok(result.context.includes('maix.camera'));
  assert.ok(result.templates.length > 0);
  assert.ok(getKnowledgeStats().apiChunks > 100);
});

