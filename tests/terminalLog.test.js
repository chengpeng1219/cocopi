import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isNoiseLine,
  isImportantDeviceOutput,
  truncateLine,
  createTerminalThrottle
} from '../src/lib/terminalLog.js';

test('isImportantDeviceOutput keeps errors and application markers only', () => {
  assert.equal(isImportantDeviceOutput('RuntimeError: VO init failed'), true);
  assert.equal(isImportantDeviceOutput('[APP_READY] camera preview'), true);
  assert.equal(
    isImportantDeviceOutput('-- [I] [Maix Comm Protocol] listening on uart port'),
    false
  );
  assert.equal(isImportantDeviceOutput('ordinary program output'), false);
});

test('isNoiseLine 丢弃 Maix 启动期的刷屏日志', () => {
  const noise = [
    '-- [I] [Maix Comm Protocol] listening on uart port',
    '[SAMPLE-VO] init fb0 done',
    'maix multi-media driver version 0.1',
    'i2c_init: 0x30',
    'AX_MPI init ok',
    'auto set pinmap for uart1',
    ''
  ];
  for (const line of noise) {
    assert.equal(isNoiseLine(line), true, `${line} 应被判定为噪声`);
  }
});

test('isNoiseLine 保留真实错误与普通输出', () => {
  const keep = [
    'Traceback (most recent call last):',
    'NameError: name display is not defined',
    'total 24',
    '[CocoPi 真机] cocopi2'
  ];
  for (const line of keep) {
    assert.equal(isNoiseLine(line), false, `${line} 不应被过滤`);
  }
});

test('truncateLine 截断超长单行并标注原始长度', () => {
  const long = 'x'.repeat(50);
  const result = truncateLine(long, 10);
  assert.match(result, /^x{10} …（该行共 50 字符，已截断）$/);
  assert.equal(truncateLine('short', 10), 'short');
});

test('同一行在时间窗内只保留一次', () => {
  let now = 0;
  const filter = createTerminalThrottle(() => now);
  // 第 1 次正常输出
  assert.equal(filter('same line').length, 1);
  // 第 2 次：同一窗口内重复，静默丢弃
  now = 1000;
  assert.equal(filter('same line').length, 0);
  // 第 3 次：达到阈值，输出一条合并提示
  now = 2000;
  const burstNotice = filter('same line');
  assert.equal(burstNotice.length, 1);
  assert.match(burstNotice[0].text, /重复输出/);
  assert.equal(burstNotice[0].type, 'info');
  // 第 4 次：仍在合并状态，继续静默
  now = 3000;
  assert.equal(filter('same line').length, 0);
  // 停止刷屏一段时间后，再次出现应重新输出
  now = 13_001;
  assert.equal(filter('same line').length, 1);
});

test('超过时间窗的同一行会重新输出', () => {
  let now = 0;
  const filter = createTerminalThrottle(() => now);
  assert.equal(filter('restart').length, 1);
  now = 10_001;
  const again = filter('restart');
  assert.equal(again.length, 1);
  assert.equal(again[0].text, 'restart');
});

test('噪声行即使重复也不产生合并提示', () => {
  let now = 0;
  const filter = createTerminalThrottle(() => now);
  for (let i = 0; i < 10; i += 1) {
    now += 100;
    assert.equal(filter('-- [I] boot tick').length, 0);
  }
});
