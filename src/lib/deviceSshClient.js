import {
  DEPLOY_RESULT_MARKER,
  STOP_RESULT_MARKER,
  buildDeploymentScript,
  buildPortablePythonCommand,
  buildSafeStopProgramScript,
  buildUploadProgramScript
} from './maixRuntime.js';

const SSH_EXEC_PATH = '/api/device/ssh/exec';
const SSH_OK_MARKER = '__COCOPI_SSH_OK__';

function normalizeConfig(config) {
  return {
    host: String(config.host || '').trim(),
    port: Number(config.port || 22),
    username: String(config.username || 'root').trim(),
    password: String(config.password || '')
  };
}

export class DeviceSshClient {
  constructor({ onLog, onDisconnect } = {}) {
    this.onLog = onLog || (() => {});
    this.onDisconnect = onDisconnect || (() => {});
    this.config = null;
  }

  async request(command, timeoutMs = 30_000) {
    if (!this.config) {
      throw new Error('SSH 设备未连接');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs + 5_000);
    let response;
    try {
      response = await fetch(SSH_EXEC_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...this.config,
          command,
          timeoutMs
        }),
        signal: controller.signal
      });
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('SSH 请求超时');
      }
      throw new Error(`无法访问 SSH 代理服务: ${error.message}`);
    } finally {
      clearTimeout(timer);
    }

    let payload;
    try {
      payload = await response.json();
    } catch (_) {
      throw new Error(`SSH 代理返回无效响应（HTTP ${response.status}）`);
    }

    if (!response.ok) {
      throw new Error(payload?.error || `SSH 代理返回 HTTP ${response.status}`);
    }
    return payload;
  }

  async connect(config) {
    this.config = normalizeConfig(config);
    const result = await this.request(
      `printf '${SSH_OK_MARKER}\\n'; hostname; uname -a`,
      12_000
    );
    if (!String(result.stdout || '').includes(SSH_OK_MARKER)) {
      this.config = null;
      throw new Error(result.error || 'SSH 握手未返回预期结果');
    }

    const lines = String(result.stdout || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && line !== SSH_OK_MARKER);
    return {
      name: lines[0] || this.config.host,
      banner: lines.slice(1).join(' | ')
    };
  }

  async execShellCommand(
    command,
    timeoutMs = 20_000,
    { silent = false, onOutput } = {}
  ) {
    const result = await this.request(command, timeoutMs);
    const stdout = String(result.stdout || '');
    const stderr = String(result.stderr || '');
    const output = stdout || stderr || result.error || '';

    if (onOutput) {
      output
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter(Boolean)
        .forEach((line) => onOutput(line));
    } else if (!silent && output.trim()) {
      output
        .trim()
        .split(/\r?\n/)
        .forEach((line) => this.onLog(line, 'device'));
    }

    return {
      output,
      stdout,
      stderr,
      exitCode: result.code,
      ok: Boolean(result.ok),
      error: result.error || ''
    };
  }

  async executePythonScript(source, timeoutMs = 75_000) {
    const result = await this.execShellCommand(
      buildPortablePythonCommand(source),
      timeoutMs,
      { silent: true }
    );
    return result.output;
  }

  async uploadProgram(pythonCode, filename = 'user_latest_code.py') {
    if (!this.config) {
      throw new Error('SSH 设备未连接');
    }
    return this.executePythonScript(
      buildUploadProgramScript(pythonCode, filename),
      20_000
    );
  }

  async deployAndRunMaixProgram(
    pythonCode,
    filename = 'user_latest_code.py',
    previousPid = null,
    { useExistingFile = false } = {}
  ) {
    try {
      const script = buildDeploymentScript(pythonCode, filename, {
        previousPid,
        useExistingFile
      });
      return await this.executePythonScript(script, 45_000);
    } catch (error) {
      return `${DEPLOY_RESULT_MARKER}${JSON.stringify({
        ok: false,
        stage: 'ssh',
        error: error?.message || String(error)
      })}`;
    }
  }

  async stopRunningPrograms(previousPid = null) {
    try {
      return await this.executePythonScript(
        buildSafeStopProgramScript(previousPid),
        35_000
      );
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

  close() {
    this.config = null;
  }
}
