import { Adb, AdbDaemonTransport } from '@yume-chan/adb';
import { AdbDaemonWebUsbDeviceManager } from '@yume-chan/adb-daemon-webusb';
import AdbWebCredentialStore from '@yume-chan/adb-credential-web';
import {
  DEPLOY_RESULT_MARKER,
  STOP_RESULT_MARKER,
  SHELL_CWD_MARKER,
  SHELL_EXIT_MARKER,
  buildDeploymentScript,
  buildSafeStopProgramScript,
  buildUploadProgramScript,
  buildPortablePythonCommand
} from './maixRuntime.js';

export class YaWebAdbClient {
  constructor({ onLog, onDisconnect } = {}) {
    this.onLog = onLog || (() => {});
    this.onDisconnect = onDisconnect || (() => {});
    this.adb = null;
    this.device = null;
    this.credentialStore = null;
    this.closed = false;
  }

  async connect() {
    if (!('usb' in navigator)) {
      throw new Error('当前浏览器不支持 WebUSB，请使用 Chrome 或 Edge');
    }

    const manager = AdbDaemonWebUsbDeviceManager.BROWSER;
    if (!manager) {
      throw new Error('WebUSB 仅在 HTTPS 或 localhost 页面可用');
    }

    const knownDevices = await manager.getDevices();
    for (const known of knownDevices) {
      try {
        if (known.raw.opened) {
          await known.raw.close();
        }
      } catch (_) {
        // Another tab or native program may own the interface.
      }
    }

    const device =
      knownDevices.length === 1
        ? knownDevices[0]
        : await manager.requestDevice();
    if (!device) {
      throw new Error('未选择 CocoPi 设备');
    }

    let connection;
    try {
      connection = await device.connect();
    } catch (error) {
      if (
        error?.name === 'DeviceBusyError' ||
        String(error?.message || '').includes('already in used')
      ) {
        throw new Error(
          'CocoPi 的 ADB 接口已被其他程序占用。请关闭 beta.v.cocorobo.cn 标签页、MaixVision、CocoBuddy 或本机 adb 服务后重试。'
        );
      }
      throw error;
    }
    this.credentialStore =
      this.credentialStore || new AdbWebCredentialStore('CocoPi Portal');
    const transport = await AdbDaemonTransport.authenticate({
      serial: device.serial,
      connection,
      credentialStore: this.credentialStore
    });

    this.device = device;
    this.adb = new Adb(transport);
    this.closed = false;

    this.adb.disconnected.then(() => {
      if (this.closed) return;
      this.adb = null;
      this.onDisconnect();
    });

    return {
      name: device.name,
      serial: device.serial,
      banner: this.adb.banner?.toString?.() || ''
    };
  }

  async runShellCommand(command, timeoutMs = 15_000, { onOutput, stopMarker = '' } = {}) {
    if (!this.adb) {
      throw new Error('设备未连接');
    }

    const process = await this.adb.subprocess.noneProtocol.spawn(command);
    const timer = setTimeout(async () => {
      try {
        await process.kill();
      } catch (_) {
        // The remote process may already have exited.
      }
    }, timeoutMs);

    try {
      const reader = process.output.getReader();
      const decoder = new TextDecoder('utf-8', { fatal: false });
      let output = '';
      let pending = '';
      let markerReceived = false;

      const emitLines = (flush = false) => {
        if (!onOutput) return;
        const lines = pending.split(/\r?\n/);
        pending = flush ? '' : lines.pop() || '';
        lines
          .filter(
            (line) =>
              line.trim() &&
              !line.startsWith(SHELL_CWD_MARKER) &&
              !line.startsWith(SHELL_EXIT_MARKER)
          )
          .forEach((line) => onOutput(line));
      };

      while (true) {
        const result = await reader.read();
        if (result.done) break;
        const text = decoder.decode(result.value, { stream: true });
        output += text;
        pending += text;
        emitLines();
        if (stopMarker) {
          const markerIndex = output.lastIndexOf(stopMarker);
          const markerEnd = markerIndex >= 0 ? output.indexOf('\n', markerIndex) : -1;
          if (markerIndex >= 0 && markerEnd > markerIndex) {
            markerReceived = true;
            try {
              await process.kill();
            } catch (_) {
              // The remote process may have already exited after printing the marker.
            }
            break;
          }
        }
      }
      const tail = decoder.decode();
      output += tail;
      pending += tail;
      emitLines(true);
      if (!markerReceived) {
        await process.exited;
      }
      return {
        output,
        timedOut: false
      };
    } catch (error) {
      return {
        output: error?.message || String(error),
        timedOut: true
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async execShellCommand(
    command,
    timeoutMs = 15_000,
    { silent = false, onOutput, stopMarker = '' } = {}
  ) {
    const result = await this.runShellCommand(command, timeoutMs, {
      onOutput: (line) => {
        if (!silent) this.onLog(line, 'device');
        onOutput?.(line);
      },
      stopMarker
    });
    if (!silent && result.output.trim()) {
      result.output
        .trim()
        .split(/\r?\n/)
        .forEach((line) => this.onLog(line, 'device'));
    }
    return result.output;
  }

  async executePythonScript(source, timeoutMs = 75_000, stopMarker = '') {
    return this.execShellCommand(buildPortablePythonCommand(source), timeoutMs, {
      silent: true,
      stopMarker
    });
  }

  async uploadProgram(pythonCode, filename = 'user_latest_code.py') {
    if (!this.adb) {
      throw new Error('设备未连接');
    }
    return this.executePythonScript(
      buildUploadProgramScript(pythonCode, filename),
      20_000
    );
  }

  async deployAndRunMaixProgram(
    pythonCode,
    filename = 'event.py',
    previousPid = null,
    { useExistingFile = false } = {}
  ) {
    if (!this.adb) {
      return `${DEPLOY_RESULT_MARKER}${JSON.stringify({
        ok: false,
        stage: 'connection',
        error: '设备未连接'
      })}`;
    }

    try {
      const script = buildDeploymentScript(pythonCode, filename, {
        previousPid,
        useExistingFile
      });
      return await this.executePythonScript(script, 30_000, DEPLOY_RESULT_MARKER);
    } catch (error) {
      return `${DEPLOY_RESULT_MARKER}${JSON.stringify({
        ok: false,
        stage: 'run',
        error: error?.message || String(error)
      })}`;
    }
  }

  async stopRunningPrograms(previousPid = null) {
    if (!this.adb) {
      return `${STOP_RESULT_MARKER}${JSON.stringify({
        ok: false,
        error: '设备未连接',
        stopped: [],
        remaining: []
      })}`;
    }

    try {
      const output = await this.executePythonScript(
        buildSafeStopProgramScript(previousPid),
        30_000,
        STOP_RESULT_MARKER
      );
      if (output.includes(STOP_RESULT_MARKER)) {
        return output;
      }
      return `${STOP_RESULT_MARKER}${JSON.stringify({
        ok: false,
        program_stopped: false,
        error: '设备未返回停止结果',
        stopped: [],
        remaining: []
      })}`;
    } catch (error) {
      return `${STOP_RESULT_MARKER}${JSON.stringify({
        ok: false,
        program_stopped: false,
        error: error?.message || String(error),
        stopped: [],
        remaining: []
      })}`;
    }
  }

  async close() {
    this.closed = true;
    if (this.adb) {
      await this.adb.close();
      this.adb = null;
    }
  }
}
