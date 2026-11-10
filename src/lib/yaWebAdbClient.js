import { Adb, AdbDaemonTransport } from '@yume-chan/adb';
import { AdbDaemonWebUsbDeviceManager } from '@yume-chan/adb-daemon-webusb';
import AdbWebCredentialStore from '@yume-chan/adb-credential-web';
import { ReadableStream } from '@yume-chan/stream-extra';
import { DEPLOY_RESULT_MARKER, STOP_RESULT_MARKER } from './maixRuntime.js';

const STOP_COMMAND =
  "pkill -f '/root/[e]vent.py' 2>/dev/null || true; " +
  "pkill -f '/root/[c]ocopi_run.py' 2>/dev/null || true; " +
  "pkill -f '/root/[u]ser_latest_code.py' 2>/dev/null || true; " +
  'systemctl stop llm-tokenizer.service sensevoice.service; ' +
  'systemctl start launcher.service && sleep 2 && echo __COCOPI_LAUNCHER_OK__';

function bytesToText(bytes) {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

export class YaWebAdbClient {
  constructor({ onLog, onDisconnect } = {}) {
    this.onLog = onLog || (() => {});
    this.onDisconnect = onDisconnect || (() => {});
    this.adb = null;
    this.device = null;
    this.credentialStore = null;
    this.programProcess = null;
    this.stoppingProgram = false;
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
      this.programProcess = null;
      this.adb = null;
      this.onDisconnect();
    });

    return {
      name: device.name,
      serial: device.serial,
      banner: this.adb.banner?.toString?.() || ''
    };
  }

  async runShellCommand(command, timeoutMs = 15_000) {
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

      while (true) {
        const result = await reader.read();
        if (result.done) break;
        output += decoder.decode(result.value, { stream: true });
      }
      output += decoder.decode();
      await process.exited;
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

  async execShellCommand(command, timeoutMs = 15_000, { silent = false } = {}) {
    const result = await this.runShellCommand(command, timeoutMs);
    if (!silent && result.output.trim()) {
      result.output
        .trim()
        .split(/\r?\n/)
        .forEach((line) => this.onLog(line, 'device'));
    }
    return result.output;
  }

  async uploadTextFile(filename, text) {
    if (!this.adb) throw new Error('设备未连接');

    const sync = await this.adb.sync();
    try {
      const bytes = new TextEncoder().encode(String(text ?? ''));
      const file = new ReadableStream({
        start(controller) {
          controller.enqueue(bytes);
          controller.close();
        }
      });
      await sync.write({
        filename,
        file,
        mtime: Math.floor(Date.now() / 1000)
      });
    } finally {
      await sync.dispose();
    }
  }

  async listFiles(path = '/root') {
    if (!this.adb) throw new Error('设备未连接');

    const sync = await this.adb.sync();
    try {
      const entries = await sync.readdir(path);
      return entries
        .filter((entry) => entry.name !== '.' && entry.name !== '..')
        .map((entry) => ({
          name: entry.name,
          size: Number(entry.size) || 0,
          mtime: Number(entry.mtime) || 0
        }));
    } finally {
      await sync.dispose();
    }
  }

  async consumeProgramOutput(process) {
    const reader = process.output.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let pending = '';

    try {
      while (true) {
        const result = await reader.read();
        if (result.done) break;
        pending += decoder.decode(result.value, { stream: true });
        const lines = pending.split(/\r?\n/);
        pending = lines.pop() || '';
        lines.filter(Boolean).forEach((line) => this.onLog(line, 'device'));
      }
      pending += decoder.decode();
      if (pending.trim()) this.onLog(pending.trim(), 'device');
    } catch (error) {
      if (!this.closed && !this.stoppingProgram) {
        this.onLog(`[ADB 输出流] ${error?.message || error}`, 'error');
      }
    }
  }

  async deployAndRunMaixProgram(
    pythonCode,
    filename = 'event.py',
    _previousPid = null,
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
      if (this.programProcess) {
        this.stoppingProgram = true;
        try {
          await this.programProcess.kill();
        } catch (_) {
          // The previous process may already have finished.
        }
        this.programProcess = null;
        await new Promise((resolve) => setTimeout(resolve, 200));
        this.stoppingProgram = false;
      }

      const remoteName = String(filename || 'event.py').replace(/[^a-zA-Z0-9_.-]/g, '_');
      const uploadedPath = `/root/${remoteName}`;
      const targetPath = useExistingFile ? uploadedPath : '/root/user_latest_code.py';

      if (!useExistingFile) {
        await this.uploadTextFile(targetPath, pythonCode);
      }

      const compileOutput = await this.execShellCommand(
        `PY=$(command -v python3 || command -v python); ` +
          `[ -n "$PY" ] && "$PY" -m py_compile '${targetPath}' && ` +
          `echo __COCOPI_COMPILE_OK__`,
        10_000,
        { silent: true }
      );
      if (!compileOutput.includes('__COCOPI_COMPILE_OK__')) {
        return `${DEPLOY_RESULT_MARKER}${JSON.stringify({
          ok: false,
          stage: 'compile',
          error: 'Python 语法检查未通过',
          output: compileOutput.slice(-3000)
        })}`;
      }

      const stopBeforeRunCommand =
        `pkill -f '/root/[e]vent.py' 2>/dev/null || true; ` +
        `pkill -f '/root/[c]ocopi_run.py' 2>/dev/null || true; ` +
        `pkill -f '/root/[u]ser_latest_code.py' 2>/dev/null || true; ` +
        `systemctl stop llm-tokenizer.service sensevoice.service; ` +
        `systemctl stop launcher.service; true`;

      await this.execShellCommand(stopBeforeRunCommand, 12_000, {
        silent: true
      });

      const runCommand =
        `sleep 0.5; ` +
        `nohup sudo python -u ${targetPath} >/tmp/cocopi_run.log 2>&1 & ` +
        `sleep 2; ` +
        `PIDS=$(ps w | awk -v self=$$ -v target='${targetPath}' ` +
        `'$1 != self && index($0, target) && $0 !~ /awk/ {print $1}'); ` +
        `if [ -n "$PIDS" ]; then echo __COCOPI_RUNNING__:$PIDS; ` +
        `else echo __COCOPI_NOT_RUNNING__; fi; ` +
        `cat /tmp/cocopi_run.log 2>/dev/null`;

      const runOutput = await this.execShellCommand(runCommand, 15_000, {
        silent: true
      });
      const running = runOutput.includes('__COCOPI_RUNNING__');
      this.programProcess = null;

      return `${DEPLOY_RESULT_MARKER}${JSON.stringify({
        ok: running,
        running,
        target: targetPath,
        uploaded: targetPath,
        output: runOutput.slice(-3000),
        error: running ? '' : '程序启动后未检测到运行进程'
      })}`;
    } catch (error) {
      return `${DEPLOY_RESULT_MARKER}${JSON.stringify({
        ok: false,
        stage: 'run',
        error: error?.message || String(error)
      })}`;
    }
  }

  async stopRunningPrograms() {
    if (!this.adb) {
      return `${STOP_RESULT_MARKER}${JSON.stringify({
        ok: false,
        error: '设备未连接',
        stopped: [],
        remaining: []
      })}`;
    }

    let stopError = '';
    if (this.programProcess) {
      this.stoppingProgram = true;
      try {
        await this.programProcess.kill();
      } catch (error) {
        stopError = error?.message || String(error);
      }
      this.programProcess = null;
    }

    let output = '';
    try {
      output = await this.execShellCommand(STOP_COMMAND, 20_000, { silent: true });
    } catch (error) {
      stopError = error?.message || String(error);
    } finally {
      this.stoppingProgram = false;
    }

    const launcherStarted = output.includes('__COCOPI_LAUNCHER_OK__');
    return `${STOP_RESULT_MARKER}${JSON.stringify({
      ok: launcherStarted,
      program_stopped: true,
      stopped: [],
      remaining: [],
      launcher: {
        started: launcherStarted,
        command: STOP_COMMAND,
        error: launcherStarted ? '' : 'systemctl start launcher.service 未返回成功标记'
      },
      error: stopError,
      output: output.slice(-3000)
    })}`;
  }

  async close() {
    this.closed = true;
    if (this.programProcess) {
      try {
        await this.programProcess.kill();
      } catch (_) {
        // Ignore shutdown errors.
      }
      this.programProcess = null;
    }
    if (this.adb) {
      await this.adb.close();
      this.adb = null;
    }
  }
}
