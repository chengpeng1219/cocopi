import test from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import {
  DEPLOY_RESULT_MARKER,
  UPLOAD_RESULT_MARKER,
  STOP_RESULT_MARKER,
  SHELL_RESULT_MARKER,
  SHELL_CWD_MARKER,
  SHELL_EXIT_MARKER,
  buildDeploymentScript,
  buildUploadProgramScript,
  buildSafeStopProgramScript,
  buildPythonCommand,
  buildPortablePythonCommand,
  parseDeploymentResult,
  parseUploadProgramResult,
  parseStopResult,
  buildNativeShellCommand,
  parseNativeShellOutput,
  buildShellCommandScript,
  parseShellCommandResult,
  shellQuote,
  buildCompressedWsScript,
  buildWifiProgramScript,
  buildWifiStopScript,
  splitWifiUploadChunks,
  buildWifiUploadInitScript,
  buildWifiUploadChunkScript,
  buildWifiCompileUploadedScript,
  buildWifiLaunchUploadedScript,
  buildWifiPrepareLaunchScript,
  WIFI_UPLOAD_INIT_MARKER,
  WIFI_COMPILE_MARKER,
  WIFI_PREPARE_MARKER,
  parseWifiCompileResult,
  wifiUploadChunkMarker
} from '../src/lib/maixRuntime.js';

test('buildDeploymentScript enters development mode before starting code', () => {
  const script = buildDeploymentScript(
    'from maix import display\nprint("hello")\n',
    'user_latest_code.py'
  );

  assert.match(script, /stop_launcher_daemon/);
  assert.match(script, /stop_user_programs/);
  assert.match(script, /stop_maixapp_apps/);
  assert.match(script, /maixapp_resource_holders/);
  assert.match(script, /'\/dev\/video'/);
  assert.match(script, /'\/dev\/dri'/);
  assert.match(script, /'\/dev\/snd'/);
  assert.match(script, /display_holder_processes/);
  assert.match(script, /release_display_resources/);
  assert.match(script, /stage': 'display_release/);
  assert.match(script, /if PREVIOUS_PID is not None/);
  assert.match(script, /systemctl', 'stop', 'launcher\.service/);
  assert.match(script, /stdin=subprocess\.DEVNULL/);
  assert.match(script, /start_new_session=True/);
  assert.match(script, /restore_launcher_service/);
  assert.match(script, /\/root\/user_latest_code\.py/);
  assert.match(script, /__COCOPI_DEPLOY_RESULT__/);
  assert.doesNotMatch(script, /display_refreshed=ok/);
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

test('buildPortablePythonCommand selects python3 or python', () => {
  const command = buildPortablePythonCommand('print("hello")');
  assert.match(command, /command -v python3 \|\| command -v python/);
  assert.match(command, /import base64;exec\(base64\.b64decode\('/);
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

test('upload script writes, compiles and registers the recent program without running it', () => {
  const script = buildUploadProgramScript('print("uploaded")', 'user_latest_code.py');
  assert.match(script, /SOURCE_CODE = "print\(\\"uploaded\\"\)"/);
  assert.match(script, /\/root\/user_latest_code\.py/);
  assert.match(script, /py_compile/);
  assert.match(script, /RECENT_PROGRAM_PATH = '\/tmp\/event'/);
  assert.match(script, /EVENT_PROGRAM_PATH = '\/root\/event\.py'/);
  assert.match(script, /shutil\.copyfile\(TARGET_PATH, EVENT_PROGRAM_PATH\)/);
  assert.match(script, /os\.symlink\(EVENT_PROGRAM_PATH, RECENT_PROGRAM_STAGING\)/);
  assert.match(script, /os\.replace\(RECENT_PROGRAM_STAGING, RECENT_PROGRAM_PATH\)/);
  assert.match(script, new RegExp(UPLOAD_RESULT_MARKER));
  assert.doesNotMatch(script, /Popen\(/);
});

test('parseUploadProgramResult reads the structured upload result', () => {
  const result = parseUploadProgramResult(
    `${UPLOAD_RESULT_MARKER}{"ok":true,"target":"/root/user_latest_code.py"}`
  );
  assert.deepEqual(result, {
    ok: true,
    target: '/root/user_latest_code.py'
  });
});

test('safe stop script waits for user processes before starting launcher', () => {
  const script = buildSafeStopProgramScript(987);
  assert.match(script, /PREVIOUS_PID = 987/);
  assert.match(script, /os\.killpg/);
  assert.match(script, /signal\.SIGINT/);
  assert.match(script, /signal\.SIGTERM/);
  assert.match(script, /signal\.SIGKILL/);
  assert.match(script, /wait_until_stopped/);
  assert.match(script, /'\/proc\/' \+ str\(pid\) \+ '\/cmdline'/);
  assert.doesNotMatch(script, /\['ps', 'w'\]/);
  assert.match(script, /systemctl', 'start', 'launcher\.service/);
  assert.doesNotMatch(script, /display_holder_processes/);
  assert.doesNotMatch(script, /force_release_display_resources/);
  assert.doesNotMatch(script, /systemctl', 'restart', 'launcher\.service/);
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
  assert.ok(message.length < 2048);

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

test('Wi-Fi source upload splits large AI programs into compact messages', async () => {
  const source = `# 中文注释\n${'print("满天星河")\n'.repeat(1400)}`;
  const chunks = splitWifiUploadChunks(source);

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 512));
  assert.equal(
    Buffer.from(chunks.join(''), 'base64').toString('utf8'),
    source
  );

  const initScript = buildWifiUploadInitScript('user_latest_code.py');
  const chunkScript = buildWifiUploadChunkScript(chunks[0], 0, 'user_latest_code.py');
  const message = await buildCompressedWsScript(chunkScript);

  assert.match(initScript, new RegExp(WIFI_UPLOAD_INIT_MARKER));
  assert.match(chunkScript, new RegExp(wifiUploadChunkMarker(0)));
  assert.ok(message.length < 1024);
});

test('Wi-Fi compile and launch stages stay below the control message limit', async () => {
  const compileScript = buildWifiCompileUploadedScript('user_latest_code.py');
  const launchScript = buildWifiLaunchUploadedScript('user_latest_code.py');
  const prepareScript = buildWifiPrepareLaunchScript();
  const compileMessage = await buildCompressedWsScript(compileScript);
  const launchMessage = await buildCompressedWsScript(launchScript);
  const prepareMessage = await buildCompressedWsScript(prepareScript);

  assert.ok(compileMessage.length < 1024);
  assert.ok(launchMessage.length < 1024);
  assert.ok(prepareMessage.length < 1024);
  assert.match(compileScript, new RegExp(WIFI_COMPILE_MARKER));
  assert.match(prepareScript, new RegExp(WIFI_PREPARE_MARKER));
  assert.match(launchScript, /nohup sudo python -u/);
  assert.match(launchScript, /pgrep/);
  assert.match(launchScript, /__COCOPI_DEPLOY_RESULT__/);
  assert.equal(
    parseWifiCompileResult(`${WIFI_COMPILE_MARKER}{"ok":true,"python":"/usr/bin/python3"}`).ok,
    true
  );
});

test('Wi-Fi stop script starts launcher.service and returns a structured result', () => {
  const script = buildWifiStopScript();
  assert.match(script, /systemctl start launcher\.service/);
  assert.match(script, /__COCOPI_STOP_RESULT__/);
  assert.match(script, /program_stopped/);
});

