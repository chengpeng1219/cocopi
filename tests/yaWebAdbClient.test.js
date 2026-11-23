import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getReadyAdbWebUsbDevices,
  YaWebAdbClient
} from '../src/lib/yaWebAdbClient.js';
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
  let resolveExited;
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
          exited: new Promise((resolve) => {
            resolveExited = resolve;
          }),
          kill: async () => {
            killed = true;
            controller.close();
            resolveExited();
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

test('ya-webadb client caps runaway shell output and kills the process', async () => {
  const client = new YaWebAdbClient();
  const process = makeProcess('A'.repeat(2_200_000));
  client.adb = {
    subprocess: {
      noneProtocol: {
        spawn: async () => process
      }
    }
  };

  const result = await client.runShellCommand('cat large-file', 3000);

  assert.equal(result.outputTruncated, true);
  assert.equal(process.wasKilled(), true);
  assert.ok(result.output.length <= 2 * 1024 * 1024);
});

test('WebUSB wrappers are refreshed after the previous interface is released', async () => {
  let opened = true;
  let getDevicesCalls = 0;
  const events = [];
  const raw = {
    get opened() {
      return opened;
    },
    close: async () => {
      events.push('close');
      opened = false;
    }
  };
  const staleDevice = { raw };
  const freshDevice = { raw };
  const manager = {
    getDevices: async () => {
      events.push(`getDevices:${getDevicesCalls}`);
      getDevicesCalls += 1;
      return getDevicesCalls === 1 ? [staleDevice] : [freshDevice];
    }
  };

  const devices = await getReadyAdbWebUsbDevices(manager);

  assert.deepEqual(events, ['getDevices:0', 'close', 'getDevices:1']);
  assert.equal(devices[0], freshDevice);
});

test('WebUSB device reset happens before reconnecting to a stale endpoint', async () => {
  let opened = false;
  const events = [];
  const raw = {
    get opened() {
      return opened;
    },
    open: async () => {
      events.push('open');
      opened = true;
    },
    reset: async () => {
      events.push('reset');
    },
    close: async () => {
      events.push('close');
      opened = false;
    }
  };
  const staleDevice = { raw };
  const freshDevice = { raw };
  let getDevicesCalls = 0;
  const manager = {
    getDevices: async () => {
      events.push(`getDevices:${getDevicesCalls}`);
      getDevicesCalls += 1;
      return getDevicesCalls === 1 ? [staleDevice] : [freshDevice];
    }
  };

  const devices = await getReadyAdbWebUsbDevices(manager, { reset: true });

  assert.deepEqual(events.slice(0, 4), [
    'getDevices:0',
    'open',
    'reset',
    'close'
  ]);
  assert.equal(devices[0], freshDevice);
});

test('closing a stalled ADB session still releases the WebUSB device', async () => {
  let opened = true;
  const client = new YaWebAdbClient({ closeTimeoutMs: 5 });
  client.adb = {
    close: () => new Promise(() => {})
  };
  client.device = {
    raw: {
      get opened() {
        return opened;
      },
      close: async () => {
        opened = false;
      }
    }
  };

  await client.close();

  assert.equal(opened, false);
  assert.equal(client.adb, null);
  assert.equal(client.device, null);
});

test('closing a session before ADB authentication finishes releases the USB interface', async () => {
  let opened = true;
  const client = new YaWebAdbClient();
  const raw = {
    get opened() {
      return opened;
    },
    close: async () => {
      opened = false;
    }
  };
  const connection = {
    readable: {
      cancel: async () => {}
    }
  };
  client.device = { raw };
  client.connection = connection;

  await client.close();

  assert.equal(opened, false);
  assert.equal(client.device, null);
  assert.equal(client.connection, null);
});

test('closing waits for ADB disconnection and cancels the old readable stream', async () => {
  const events = [];
  let resolveDisconnected;
  const client = new YaWebAdbClient({ closeTimeoutMs: 50 });
  client.adb = {
    close: async () => {
      events.push('adb.close');
    },
    disconnected: new Promise((resolve) => {
      resolveDisconnected = resolve;
    })
  };
  client.connection = {
    readable: {
      cancel: async () => {
        events.push('readable.cancel');
      }
    }
  };
  client.device = {
    raw: {
      get opened() {
        return true;
      },
      close: async () => {
        events.push('usb.close');
      }
    }
  };

  const closing = client.close();
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.deepEqual(events, ['adb.close']);

  resolveDisconnected();
  await closing;

  assert.deepEqual(events, ['adb.close', 'readable.cancel', 'usb.close']);
});

test('USB gadget rebind is scheduled before disconnecting', async () => {
  const client = new YaWebAdbClient();
  let command = '';
  client.adb = {};
  client.execShellCommand = async (source) => {
    command = source;
    return 'Running timer as unit: cocopi-usb-rebind-test\n__COCOPI_USB_REBIND_OK__\n';
  };

  const scheduled = await client.scheduleUsbGadgetRebind();

  assert.equal(scheduled, true);
  assert.match(command, /systemd-run --unit=cocopi-usb-rebind-/);
  assert.match(command, /--on-active=2/);
  assert.match(command, /systemctl restart usb-gadget\.service/);
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
