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

const MAX_COMMAND_OUTPUT_BYTES = 2 * 1024 * 1024;
const USB_CONNECT_TIMEOUT_MS = 12_000;
const USB_AUTH_TIMEOUT_MS = 15_000;
const USB_CLOSE_TIMEOUT_MS = 1_500;
const USB_RESET_TIMEOUT_MS = 2_500;
const USB_REBIND_DELAY_SECONDS = 2;
const USB_REBIND_WAIT_MS = 15_000;
const PROCESS_EXIT_TIMEOUT_MS = 1_000;
let webUsbResetPending = false;
let usbRebindWaitUntil = 0;
let usbRebindNotBefore = 0;

function withTimeout(promise, timeoutMs, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function settlesWithin(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(false), timeoutMs);
  });
  try {
    return await Promise.race([
      promise.then(
        () => true,
        () => true
      ),
      timeout
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function releaseUsbDevice(device) {
  if (!device?.raw?.opened) return true;
  try {
    return await settlesWithin(device.raw.close(), USB_CLOSE_TIMEOUT_MS);
  } catch (_) {
    return false;
  }
}

async function releaseConnectionReadable(connection) {
  if (!connection?.readable) return true;
  try {
    return await settlesWithin(
      connection.readable.cancel(),
      USB_CLOSE_TIMEOUT_MS
    );
  } catch (_) {
    return false;
  }
}

async function resetUsbDevice(device) {
  const raw = device?.raw;
  if (!raw) return false;

  try {
    if (!raw.opened) {
      const opened = await settlesWithin(raw.open(), USB_RESET_TIMEOUT_MS);
      if (!opened) return false;
    }
    return await settlesWithin(raw.reset(), USB_RESET_TIMEOUT_MS);
  } catch (_) {
    return false;
  } finally {
    await releaseUsbDevice(device);
  }
}

export async function getReadyAdbWebUsbDevices(manager, { reset = false } = {}) {
  while (Date.now() < usbRebindWaitUntil) {
    if (Date.now() < usbRebindNotBefore) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      continue;
    }
    const devices = await manager.getDevices();
    if (devices.length > 0) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  // Device wrappers snapshot USBInterface.claimed; refresh them after closing
  // the previous session so the new wrapper can claim the interface correctly.
  const staleDevices = await manager.getDevices();
  if (reset && staleDevices.length > 0) {
    const resetResults = await Promise.all(
      staleDevices.map((device) => resetUsbDevice(device))
    );
    if (resetResults.some(Boolean)) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  } else {
    await Promise.all(staleDevices.map((device) => releaseUsbDevice(device)));
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const devices = await manager.getDevices();
    if (devices.length > 0 || !reset) return devices;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return [];
}

export class YaWebAdbClient {
  constructor({ onLog, onDisconnect, closeTimeoutMs = USB_CLOSE_TIMEOUT_MS } = {}) {
    this.onLog = onLog || (() => {});
    this.onDisconnect = onDisconnect || (() => {});
    this.adb = null;
    this.device = null;
    this.connection = null;
    this.credentialStore = null;
    this.closed = false;
    this.closeTimeoutMs = closeTimeoutMs;
    this.closePromise = null;
  }

  async connect() {
    if (!('usb' in navigator)) {
      throw new Error('当前浏览器不支持 WebUSB，请使用 Chrome 或 Edge');
    }

    const manager = AdbDaemonWebUsbDeviceManager.BROWSER;
    if (!manager) {
      throw new Error('WebUSB 仅在 HTTPS 或 localhost 页面可用');
    }

    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const rebindPending = Date.now() < usbRebindWaitUntil;
      const knownDevices = await getReadyAdbWebUsbDevices(manager, {
        reset: !rebindPending && (attempt > 0 || webUsbResetPending)
      });

      let device;
      if (knownDevices.length === 1) {
        device = knownDevices[0];
      } else if (attempt === 0) {
        device = await manager.requestDevice();
      }
      if (!device) {
        throw lastError || new Error('未选择 CocoPi 设备');
      }

      try {
        return await this.openDevice(device);
      } catch (error) {
        await releaseConnectionReadable(this.connection);
        await releaseUsbDevice(device);
        if (this.device === device) {
          this.device = null;
        }
        this.connection = null;
        lastError = this.normalizeConnectionError(error);
        if (attempt === 0 && this.isRecoverableConnectionError(error)) {
          webUsbResetPending = true;
          this.onLog('[ADB 有线] 认证未响应，正在复位 USB 接口并重试。', 'info');
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error('设备连接失败');
  }

  async openDevice(device) {
    this.closed = false;
    this.device = device;
    let connection;
    connection = await withTimeout(
      device.connect(),
      USB_CONNECT_TIMEOUT_MS,
      '连接设备 USB 接口超时，请重新插拔数据线后重试'
    );
    this.connection = connection;
    this.credentialStore =
      this.credentialStore || new AdbWebCredentialStore('CocoPi Portal');
    const transport = await withTimeout(
      AdbDaemonTransport.authenticate({
        serial: device.serial,
        connection,
        credentialStore: this.credentialStore
      }),
      USB_AUTH_TIMEOUT_MS,
      '设备 ADB 认证超时，请重新插拔数据线后重试'
    );

    const adb = new Adb(transport);
    this.adb = adb;
    webUsbResetPending = false;
    usbRebindWaitUntil = 0;
    usbRebindNotBefore = 0;

    const handleDisconnect = () => {
      if (this.closed || this.adb !== adb) return;
      this.adb = null;
      this.connection = null;
      this.onDisconnect();
    };
    adb.disconnected.then(handleDisconnect, handleDisconnect);

    return {
      name: device.name,
      serial: device.serial,
      banner: adb.banner?.toString?.() || ''
    };
  }

  normalizeConnectionError(error) {
    if (
      error?.name === 'DeviceBusyError' ||
      String(error?.message || '').includes('already in used')
    ) {
      return new Error(
        'CocoPi 的 ADB 接口已被其他程序占用。请关闭 beta.v.cocorobo.cn 标签页、MaixVision、CocoBuddy 或本机 adb 服务后重试。'
      );
    }
    return error;
  }

  isRecoverableConnectionError(error) {
    const message = String(error?.message || '');
    return (
      message.includes('ADB 认证超时') ||
      message.includes('USB 接口超时') ||
      error?.name === 'NetworkError'
    );
  }

  async scheduleUsbGadgetRebind() {
    if (!this.adb) return false;
    const marker = '__COCOPI_USB_REBIND_OK__';
    const unit = `cocopi-usb-rebind-${Date.now()}`;
    const command =
      `systemd-run --unit=${unit} ` +
      `--on-active=${USB_REBIND_DELAY_SECONDS} --collect ` +
      `/bin/systemctl restart usb-gadget.service && ` +
      `printf '${marker}\\n'`;
    try {
      const output = await this.execShellCommand(command, 5_000, {
        silent: true
      });
      if (!output.includes(marker)) {
        this.onLog(
          '[ADB 有线] 设备未确认 USB ADB 重建任务，断开后仍会继续释放接口。',
          'error'
        );
        return false;
      }
      usbRebindWaitUntil = Date.now() + USB_REBIND_WAIT_MS;
      usbRebindNotBefore =
        Date.now() + USB_REBIND_DELAY_SECONDS * 1000 + 1_500;
      this.onLog(
        `[ADB 有线] 已安排 USB ADB 端点重建，约 ${USB_REBIND_DELAY_SECONDS} 秒后自动恢复。`,
        'info'
      );
      return true;
    } catch (error) {
      this.onLog(
        `[ADB 有线] 安排 USB ADB 重建失败：${error?.message || String(error)}`,
        'error'
      );
      return false;
    }
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
      let outputTruncated = false;
      let outputLimitKilled = false;
      const byteEncoder = new TextEncoder();

      const appendLimitedOutput = (current, text) => {
        const combined = current + text;
        if (combined.length * 4 <= MAX_COMMAND_OUTPUT_BYTES) return combined;
        const encoded = byteEncoder.encode(combined);
        if (encoded.byteLength <= MAX_COMMAND_OUTPUT_BYTES) return combined;
        outputTruncated = true;
        if (!outputLimitKilled) {
          outputLimitKilled = true;
          process.kill().catch(() => {});
        }
        return new TextDecoder('utf-8', { fatal: false }).decode(
          encoded.slice(-MAX_COMMAND_OUTPUT_BYTES)
        );
      };

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
        output = appendLimitedOutput(output, text);
        pending = appendLimitedOutput(pending, text);
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
      output = appendLimitedOutput(output, tail);
      pending = appendLimitedOutput(pending, tail);
      emitLines(true);
      if (markerReceived) {
        await settlesWithin(process.exited, PROCESS_EXIT_TIMEOUT_MS);
      } else {
        await process.exited;
      }
      return {
        output,
        timedOut: false,
        outputTruncated
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
    if (result.outputTruncated) {
      this.onLog('[输出已截断] 命令输出超过 2 MB，远端进程已终止。', 'error');
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
    if (this.closePromise) return this.closePromise;
    this.closed = true;
    const adb = this.adb;
    const device = this.device;
    const connection = this.connection;
    this.adb = null;
    this.connection = null;
    this.device = null;

    this.closePromise = (async () => {
      if (connection && !adb) {
        // The user can disconnect while authenticate() is still pending. That
        // promise may never settle after cancellation, but the USB interface
        // and its stream still need to be released before a later reconnect.
        await releaseConnectionReadable(connection);
      }

      if (adb) {
        const closedGracefully = await settlesWithin(
          Promise.resolve().then(() => adb.close()),
          this.closeTimeoutMs
        );
        if (!closedGracefully) {
          await releaseConnectionReadable(connection);
          this.onLog(
            '[ADB 有线] ADB 会话关闭超时，正在强制释放 USB 接口。',
            'debug'
          );
        }

        const disconnected = await settlesWithin(
          Promise.resolve(adb.disconnected),
          this.closeTimeoutMs
        );
        if (!disconnected) {
          await releaseConnectionReadable(connection);
          this.onLog(
            '[ADB 有线] ADB 数据流未完全释放，正在取消旧连接。',
            'debug'
          );
        }
      }

      await releaseConnectionReadable(connection);
      const released = await releaseUsbDevice(device);
      if (device) webUsbResetPending = true;
      if (!released) {
        this.onLog('[ADB 有线] USB 接口释放超时，请重新插拔数据线。', 'error');
      }
    })().finally(() => {
      this.closePromise = null;
    });

    return this.closePromise;
  }
}
