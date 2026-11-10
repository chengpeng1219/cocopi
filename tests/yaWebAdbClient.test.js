import test from 'node:test';
import assert from 'node:assert/strict';
import { YaWebAdbClient } from '../src/lib/yaWebAdbClient.js';
import {
  parseDeploymentResult,
  parseStopResult,
  DEPLOY_RESULT_MARKER,
  STOP_RESULT_MARKER
} from '../src/lib/maixRuntime.js';

function makeProcess(output = '') {
  let killed = false;
  return {
    output: new ReadableStream({
      start(controller) {
        if (output) controller.enqueue(new TextEncoder().encode(output));
        controller.close();
      }
    }),
    exited: Promise.resolve(),
    kill: async () => {
      killed = true;
    },
    wasKilled: () => killed
  };
}

test('ya-webadb client runs shell output through a remote process', async () => {
  const client = new YaWebAdbClient();
  client.adb = {
    subprocess: {
      noneProtocol: {
        spawn: async () => makeProcess('hello\nworld\n')
      }
    }
  };

  const result = await client.runShellCommand('echo hello', 3000);
  assert.equal(result.output, 'hello\nworld\n');
});

test('run command uses systemd and uploads user_latest_code.py', async () => {
  const client = new YaWebAdbClient();
  const uploads = [];
  const commands = [];

  client.uploadTextFile = async (filename, text) => {
    uploads.push({ filename, text });
  };
  client.execShellCommand = async (command) => {
    commands.push(command);
    if (command.includes('__COCOPI_COMPILE_OK__')) {
      return '__COCOPI_COMPILE_OK__';
    }
    return '__COCOPI_RUNNING__\n[CocoPi] started';
  };
  client.adb = {};

  const result = parseDeploymentResult(
    await client.deployAndRunMaixProgram('print("hello")', 'user_latest_code.py')
  );

  assert.equal(result.ok, true);
  assert.equal(result.target, '/root/user_latest_code.py');
  assert.equal(uploads.length, 1);
  assert.deepEqual(
    uploads.map((item) => item.filename),
    ['/root/user_latest_code.py']
  );
  const stopBeforeRunCommand = commands.find((item) =>
    item.includes("pkill -f '/root/[c]ocopi_run.py'")
  );
  const runCommand = commands.find((item) =>
    item.includes('nohup sudo python -u /root/user_latest_code.py')
  );
  assert.match(stopBeforeRunCommand, /systemctl stop launcher\.service/);
  assert.match(runCommand, /nohup sudo python -u \/root\/user_latest_code\.py/);
  assert.match(runCommand, /__COCOPI_RUNNING__/);
});

test('stop command kills the remote process and starts launcher.service', async () => {
  const client = new YaWebAdbClient();
  const process = makeProcess();
  let executed = '';
  client.programProcess = process;
  client.execShellCommand = async (command) => {
    executed = command;
    return '__COCOPI_LAUNCHER_OK__';
  };
  client.adb = {
    subprocess: { noneProtocol: { spawn: async () => process } }
  };

  const result = parseStopResult(await client.stopRunningPrograms());

  assert.equal(result.ok, true);
  assert.equal(result.program_stopped, true);
  assert.equal(result.launcher.started, true);
  assert.match(executed, /systemctl start launcher\.service/);
  assert.match(executed, /\/root\/\[u\]ser_latest_code\.py/);
});
