import test from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import {
  DEPLOY_RESULT_MARKER,
  STOP_RESULT_MARKER,
  SHELL_RESULT_MARKER,
  SHELL_CWD_MARKER,
  SHELL_EXIT_MARKER,
  buildDeploymentScript,
  buildStopProgramScript,
  buildPythonCommand,
  parseDeploymentResult,
  parseStopResult,
  buildNativeShellCommand,
  parseNativeShellOutput,
  buildShellCommandScript,
  parseShellCommandResult,
  shellQuote,
  buildCompressedWsScript,
  buildWifiProgramScript,
  buildWifiStopScript
} from '../src/lib/maixRuntime.js';

test('buildDeploymentScript enters development mode before starting code', () => {
  const script = buildDeploymentScript(
    'from maix import display\nprint("hello")\n',
    'user_latest_code.py'
  );

  assert.match(script, /stop_launcher_daemon/);
  assert.match(script, /stop_user_programs/);
  assert.match(script, /stop_maixapp_apps/);
  assert.match(script, /from maix import display, image/);
  assert.match(script, /display\.Display\(\)/);
  assert.match(script, /start_new_session=True/);
  assert.match(script, /\/root\/user_latest_code\.py/);
  assert.match(script, /__COCOPI_DEPLOY_RESULT__/);
});

test('buildDeploymentScript stops a previously tracked PID before launch', () => {
  const script = buildDeploymentScript('print("safe")', 'user_latest_code.py', {
    previousPid: 321
  });
  assert.match(script, /PREVIOUS_PID = 321/);
  assert.match(script, /os\.killpg/);
});

test('buildDeploymentScript can run an existing device file', () => {
  const script = buildDeploymentScript('', 'main.py', { useExistingFile: true });
  assert.match(script, /USE_EXISTING_FILE = True/);
  assert.match(script, /os\.path\.isfile\(TARGET_PATH\)/);
});

test('buildDeploymentScript sanitizes unsafe filenames', () => {
  const script = buildDeploymentScript('print("safe")', '../../bad name.py');
  assert.match(script, /\/root\/\.\._\.\._bad_name\.py/);
  assert.doesNotMatch(script, /\/root\/\.\.\/\.\.\/bad name\.py/);
});

test('buildPythonCommand base64-encodes Python source', () => {
  const command = buildPythonCommand('print("hello")');
  assert.match(command, /^python3 -c "import base64;exec\(base64\.b64decode\('/);
});

test('parseDeploymentResult reads the final structured status line', () => {
  const output = [
    'device boot log',
    `${DEPLOY_RESULT_MARKER}{"ok":true,"stage":"running","running":true,"pid":42}`,
    'shell prompt'
  ].join('\n');

  assert.deepEqual(parseDeploymentResult(output), {
    ok: true,
    stage: 'running',
    running: true,
    pid: 42
  });
});

test('parseDeploymentResult ignores malformed status data', () => {
  assert.equal(parseDeploymentResult(`${DEPLOY_RESULT_MARKER}{bad json}`), null);
});

test('stop script kills the user process group and restores launcher', () => {
  const script = buildStopProgramScript(987);
  assert.match(script, /PREVIOUS_PID = 987/);
  assert.match(script, /os\.killpg/);
  assert.match(script, /launcher_daemon/);
  assert.match(script, /candidates\.append\(\[LAUNCHER, 'daemon'\]\)/);
  assert.match(script, /stop_launcher_processes/);
  assert.match(script, /__COCOPI_STOP_RESULT__/);
});

test('parseStopResult returns stopped and launcher status', () => {
  const output = `${STOP_RESULT_MARKER}{"ok":true,"stopped":[42],"remaining":[],"launcher":{"started":true}}`;
  assert.deepEqual(parseStopResult(output), {
    ok: true,
    stopped: [42],
    remaining: [],
    launcher: { started: true }
  });
});

test('native shell command tracks cwd and exit code', () => {
  const cwd = "/root/it's here";
  const command = buildNativeShellCommand('ls -la', cwd);
  assert.match(command, /\/root\/it'"'"'s here/);
  assert.match(command, new RegExp(SHELL_CWD_MARKER));
  assert.match(command, new RegExp(SHELL_EXIT_MARKER));
});

test('parseNativeShellOutput removes control markers', () => {
  const output = `a.txt\nb.txt\n${SHELL_CWD_MARKER}/root\n${SHELL_EXIT_MARKER}0\n`;
  assert.deepEqual(parseNativeShellOutput(output), {
    output: 'a.txt\nb.txt',
    cwd: '/root',
    exitCode: 0,
    trailing: ''
  });
});

test('shell command script and parser round-trip structured output', () => {
  const script = buildShellCommandScript('ls /root', '/root', 5);
  assert.match(script, /subprocess\.run/);
  assert.match(script, /__COCOPI_SHELL_RESULT__/);

  const output = `${SHELL_RESULT_MARKER}{"ok":true,"returncode":0,"stdout":"x","stderr":"","cwd":"/root"}`;
  assert.deepEqual(parseShellCommandResult(output), {
    ok: true,
    returncode: 0,
    stdout: 'x',
    stderr: '',
    cwd: '/root'
  });
});

test('shellQuote safely escapes single quotes', () => {
  assert.equal(shellQuote("a'b"), "'a'\"'\"'b'");
});

test('buildCompressedWsScript keeps large source as one small ASCII message', async () => {
  const source = `print(${JSON.stringify('A'.repeat(4000))})`;
  const message = await buildCompressedWsScript(source);
  assert.match(message, /^import base64,gzip;exec\(compile\(gzip\.decompress/);
  assert.ok(message.length < source.length);
  assert.ok(message.length < 4096);

  const encoded = message.match(/base64\.b64decode\('([^']+)'\)/)?.[1];
  assert.ok(encoded);
  assert.equal(gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'), source);
});

test('Wi-Fi run script uses user_latest_code.py and systemd', () => {
  const script = buildWifiProgramScript('print("wifi")', 'user_latest_code.py');
  assert.match(script, /\/root\/user_latest_code\.py/);
  assert.match(script, /systemctl stop launcher\.service/);
  assert.match(script, /sudo python -u/);
  assert.match(script, /__COCOPI_DEPLOY_RESULT__/);
});

test('Wi-Fi stop script starts launcher.service and returns a structured result', () => {
  const script = buildWifiStopScript();
  assert.match(script, /systemctl start launcher\.service/);
  assert.match(script, /__COCOPI_STOP_RESULT__/);
  assert.match(script, /program_stopped/);
});


