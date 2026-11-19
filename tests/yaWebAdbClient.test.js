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

test('ya-webadb client stops reading immediately after the result marker', async () => {
  const client = new YaWebAdbClient();
  let controller;
  let killed = false;
  client.adb = {
    subprocess: {
      noneProtocol: {
        spawn: async () => ({
          output: new ReadableStream({
            start(streamController) {
              controller = streamController;
              streamController.enqueue(
                new TextEncoder().encode(`${DEPLOY_RESULT_MARKER}{"ok":true}\n`)
              );
            }
          }),
          exited: new Promise(() => {}),
          kill: async () => {
            killed = true;
            controller.close();
          }
        })
      }
    }
  };

  const result = await client.runShellCommand('deploy', 30_000, {
    stopMarker: DEPLOY_RESULT_MARKER
  });

  assert.equal(killed, true);
  assert.match(result.output, /__COCOPI_DEPLOY_RESULT__/);
});

test('deploy command enters development mode and tracks the remote PID', async () => {
  const client = new YaWebAdbClient();
  const scripts = [];

  client.executePythonScript = async (script) => {
    scripts.push(script);
    return `${DEPLOY_RESULT_MARKER}{"ok":true,"running":true,"pid":42,"target":"/root/user_latest_code.py"}`;
  };
  client.adb = {};

  const result = parseDeploymentResult(
    await client.deployAndRunMaixProgram('print("hello")', 'user_latest_code.py')
  );

  assert.equal(result.ok, true);
  assert.equal(result.pid, 42);
  assert.equal(result.target, '/root/user_latest_code.py');
  assert.equal(scripts.length, 1);
  assert.match(scripts[0], /stop_launcher_daemon/);
  assert.match(scripts[0], /stop_maixapp_apps/);
  assert.match(scripts[0], /stdin=subprocess\.DEVNULL/);
  assert.match(scripts[0], /start_new_session=True/);
  assert.match(scripts[0], /__COCOPI_DEPLOY_RESULT__/);
});

test('stop command kills the remote process and restores the launcher', async () => {
  const client = new YaWebAdbClient();
  let script = '';
  client.executePythonScript = async (source) => {
    script = source;
    return `${STOP_RESULT_MARKER}{"ok":true,"program_stopped":true,"stopped":[42],"remaining":[],"launcher":{"started":true}}`;
  };
  client.adb = {};

  const result = parseStopResult(await client.stopRunningPrograms(42));

  assert.equal(result.ok, true);
  assert.equal(result.program_stopped, true);
  assert.equal(result.launcher.started, true);
  assert.match(script, /PREVIOUS_PID = 42/);
  assert.match(script, /signal\.SIGINT/);
  assert.match(script, /wait_until_stopped/);
  assert.match(script, /systemctl', 'start', 'launcher\.service/);
  assert.doesNotMatch(script, /display_holder_processes/);
});
