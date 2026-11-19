import { lazy, Suspense, useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Languages,
  Menu,
  Plus,
  Play,
  Puzzle,
  RotateCw,
  Save,
  Upload,
  X
} from 'lucide-react';
import { YaWebAdbClient } from './lib/yaWebAdbClient.js';
import { DeviceSshClient } from './lib/deviceSshClient.js';
import { createWifiQrMatrix } from './lib/qr.js';
import {
  isNoiseLine,
  truncateLine,
  createTerminalThrottle,
  appendTerminalEntry,
  isImportantDeviceOutput
} from './lib/terminalLog.js';
import { requestMaixPyCode } from './lib/aiClient.js';
import { validateMaixPyCode, summarizeDeviceOutput } from './lib/maixpyValidator.js';
import {
  parseDeploymentResult,
  parseStopResult,
  buildNativeShellCommand,
  parseNativeShellOutput,
  parseUploadProgramResult
} from './lib/maixRuntime.js';
import { HARDWARE_PARTS } from './data/hardwareParts.js';
import { MAIXPY_PROGRAMS } from './data/maixpyPrograms.js';
import { generateLocalMaixPyFallback } from './data/maixpy.js';
import OverviewSection from './components/OverviewSection.jsx';
import QrModal from './components/QrModal.jsx';
import DeviceDrawer from './components/DeviceDrawer.jsx';
import { useI18n } from './lib/i18n.jsx';
import { buttonStyles, cx } from './components/ui.jsx';

const APP_SECTIONS = [
  { id: 'blocks', labelKey: 'nav.blocks', icon: Puzzle },
  { id: 'overview', labelKey: 'nav.overview', icon: Box }
];
const IMPORTANT_PLATFORM_INFO_PATTERN =
  /失败|错误|超时|断开|恢复|取消|不可用|未连接|停止|重试|重连|握手/i;
const BlocklySection = lazy(() => import('./components/BlocklySection.jsx'));

// ==========================================
// 主应用组件：只负责状态与业务编排，界面拆分在 components/ 下
// ==========================================
export default function App() {
  const { language, setLanguage, t } = useI18n();
  const [activeSection, setActiveSection] = useState('blocks');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showDeviceDrawer, setShowDeviceDrawer] = useState(false);

  // 3D 模型交互状态
  const [selectedPart, setSelectedPart] = useState(HARDWARE_PARTS.screen);
  const [targetCamPos, setTargetCamPos] = useState([2.8, 1.8, 5.2]);
  const [zoomTrigger, setZoomTrigger] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // 连接状态 ('usb-webusb' | 'ssh-real')
  const [connectionTab, setConnectionTab] = useState('usb');
  const [connStatus, setConnStatus] = useState('disconnected');
  const [connType, setConnType] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({
    portName: t('device.disconnected'),
    ip: '192.168.0.64',
    sshPort: '22'
  });

  const [sshIpInput, setSshIpInput] = useState('192.168.0.64');
  const [sshPortInput, setSshPortInput] = useState('22');
  const [sshUserInput, setSshUserInput] = useState('root');
  const [sshPasswordInput, setSshPasswordInput] = useState('');
  const [sshError, setSshError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSsid, setQrSsid] = useState('SmartLab_5G');
  const [qrPassword, setQrPassword] = useState('cocopi2026');

  const [terminalLogs, setTerminalLogs] = useState([
    {
      time: '11:00:00',
      type: 'info',
      text: t('terminal.ready')
    }
  ]);
  const [replInput, setReplInput] = useState('');
  const [deviceCwd, setDeviceCwd] = useState('/root');

  // 编程沙盒与 AI 编程状态
  const [activeProgram, setActiveProgram] = useState(MAIXPY_PROGRAMS[0]);
  const [editableCode, setEditableCode] = useState(MAIXPY_PROGRAMS[0].python);
  const [copiedCode, setCopiedCode] = useState(false);
  const [programState, setProgramState] = useState('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const isProgramBusy =
    programState === 'deploying' ||
    programState === 'stopping' ||
    isUploading ||
    isRestarting;

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [lastRunError, setLastRunError] = useState('');

  const adbClientRef = useRef(null);
  const sshClientRef = useRef(null);
  const terminalContainerRef = useRef(null);
  const timersRef = useRef([]);
  const deploymentTimeoutRef = useRef(null);
  const stopTimeoutRef = useRef(null);
  const deploymentSettledRef = useRef(false);
  const stopSettledRef = useRef(false);
  const runningPidRef = useRef(null);
  const deviceCwdRef = useRef('/root');
  const terminalFilterRef = useRef(null);
  if (terminalFilterRef.current === null) {
    terminalFilterRef.current = createTerminalThrottle();
  }
  const terminalFilter = (line) => terminalFilterRef.current(line);
  const isSecureContext =
    typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false;

  const navigateToSection = (sectionId) => {
    setActiveSection(sectionId);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!showQrModal) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowQrModal(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showQrModal]);

  const registerTimer = (fn, delay) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  };

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    deploymentTimeoutRef.current = null;
    stopTimeoutRef.current = null;
  };

  const appendLog = (text, type = 'info') => {
    const rawLines = String(text ?? '').split(/\r?\n/);
    const keepDevice = type === 'device';
    const keepShell = type === 'shell';

    for (const rawLine of rawLines) {
      const line = truncateLine(rawLine.trim());
      if (!line) continue;
      if (type === 'debug') continue;
      if (type === 'info' && !IMPORTANT_PLATFORM_INFO_PATTERN.test(line)) continue;
      if (keepDevice && (isNoiseLine(line) || !isImportantDeviceOutput(line))) continue;

      const output = keepDevice ? terminalFilter(line) : null;
      if (keepDevice && output.length === 0) continue;

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const entries = keepDevice
        ? output.map((item) => ({ time: timeStr, type: item.type || 'device', text: item.text }))
        : [{ time: timeStr, type: keepShell ? 'device' : type, text: line }];

      setTerminalLogs((prev) => entries.reduce(appendTerminalEntry, prev));
    }
  };

  const setProgramStateUnlessActive = (nextState) => {
    setProgramState((current) =>
      ['deploying', 'running', 'stopping'].includes(current) ? current : nextState
    );
  };

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      if (adbClientRef.current) adbClientRef.current.close();
      if (sshClientRef.current) sshClientRef.current.close();
    };
  }, []);

  // ==========================================
  // 5. 有线 ADB Interface 连接
  // ==========================================
  const handleAdbWiredConnect = async () => {
    if (!isSecureContext) {
      appendLog(
        '[错误] WebUSB 需要 HTTPS 或 localhost 安全上下文。请通过 HTTPS 访问页面后再连接设备。',
        'error'
      );
      return;
    }
    if (!('usb' in navigator)) {
      appendLog('[错误] 当前浏览器不支持 WebUSB API，请使用 Chrome 或 Edge 浏览器。', 'error');
      return;
    }

    try {
      clearAllTimers();
      if (adbClientRef.current) {
        await adbClientRef.current.close();
        adbClientRef.current = null;
      }
      if (sshClientRef.current) {
        sshClientRef.current.close();
        sshClientRef.current = null;
      }

      setConnStatus('connecting');
      appendLog('[ADB 有线] 请在弹出的浏览器窗口中选择 CocoPi 设备...');

      const client = new YaWebAdbClient({
        onLog: appendLog,
        onDisconnect: () => {
          if (adbClientRef.current !== client) return;
          adbClientRef.current = null;
          setConnStatus('disconnected');
          setConnType(null);
          setProgramState('idle');
          runningPidRef.current = null;
          appendLog('[ADB 有线] 设备连接已断开', 'error');
        }
      });
      adbClientRef.current = client;

      const info = await client.connect();
      setConnStatus('connected');
      setConnType('usb-webusb');
      setProgramState('idle');
      runningPidRef.current = null;
      deviceCwdRef.current = '/root';
      setDeviceCwd('/root');
      setDeviceInfo((prev) => ({
        ...prev,
        portName: `ADB (${info.name || info.serial || 'CocoPi'})`
      }));
      appendLog(
        `[ADB 有线] ya-webadb 已连接: ${info.name || info.serial}${info.banner ? ` | ${info.banner}` : ''}`,
        'success'
      );
    } catch (err) {
      const failedClient = adbClientRef.current;
      adbClientRef.current = null;
      setConnStatus('disconnected');
      setConnType(null);
      setProgramState('idle');
      runningPidRef.current = null;
      appendLog(`[ADB 连接取消或失败] ${err.message}`, 'error');
      if (failedClient) {
        await Promise.race([
          failedClient.close().catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 1_500))
        ]);
      }
    }
  };

  const handleSshConnect = async () => {
    setSshError('');
    const host = sshIpInput.trim();
    const port = Number(sshPortInput);
    const username = sshUserInput.trim();
    const ipv4Regex =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    if (!ipv4Regex.test(host)) {
      setSshError('请输入设备局域网 IPv4 地址');
      return;
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      setSshError('SSH 端口需为 1 ~ 65535 之间的整数');
      return;
    }
    if (!username) {
      setSshError('请输入 SSH 用户名');
      return;
    }

    clearAllTimers();
    if (adbClientRef.current) {
      await adbClientRef.current.close();
      adbClientRef.current = null;
    }
    if (sshClientRef.current) {
      sshClientRef.current.close();
    }

    setConnStatus('connecting');
    const client = new DeviceSshClient({ onLog: appendLog });
    sshClientRef.current = client;
    try {
      const info = await client.connect({
        host,
        port,
        username,
        password: sshPasswordInput
      });
      setConnStatus('connected');
      setConnType('ssh-real');
      setProgramState('idle');
      runningPidRef.current = null;
      deviceCwdRef.current = '/root';
      setDeviceCwd('/root');
      setDeviceInfo({
        ip: host,
        sshPort: String(port),
        portName: `SSH (${host}:${port})`
      });
      setSshPasswordInput('');
      appendLog(
        `[SSH] 已通过 ${host}:${port} 连接设备${info.name ? `: ${info.name}` : ''}`,
        'success'
      );
    } catch (error) {
      client.close();
      if (sshClientRef.current === client) {
        sshClientRef.current = null;
      }
      setConnStatus('disconnected');
      setConnType(null);
      setSshError(error.message);
      appendLog(`[SSH 连接失败] ${error.message}`, 'error');
    }
  };

  // ==========================================
  // 6. Linux Shell 终端与用户程序生命周期管理
  // ==========================================
  const setDeviceWorkingDirectory = (cwd) => {
    if (!cwd) return;
    deviceCwdRef.current = cwd;
    setDeviceCwd(cwd);
  };

  const appendShellOutput = (stdout, stderr, exitCode) => {
    const stdoutText = String(stdout || '').trim();
    const stderrText = String(stderr || '').trim();
    if (stdoutText) {
      stdoutText.split(/\r?\n/).forEach((line) => appendLog(line, 'shell'));
    }
    if (stderrText) {
      stderrText.split(/\r?\n/).forEach((line) => appendLog(line, 'error'));
    }
    if (!stdoutText && !stderrText && exitCode === 0) {
      appendLog('[命令执行完成，无输出]', 'info');
    }
    if (Number.isFinite(exitCode) && exitCode !== 0) {
      appendLog(`[退出码 ${exitCode}]`, 'error');
    }
  };

  const handleStopResult = (output) => {
    const result = parseStopResult(output);
    if (!result) return false;

    stopSettledRef.current = true;
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      timersRef.current = timersRef.current.filter(
        (timerId) => timerId !== stopTimeoutRef.current
      );
      stopTimeoutRef.current = null;
    }

    if (result.program_stopped || result.ok) {
      runningPidRef.current = null;
      const stopped = result.stopped?.length ? `，PID: ${result.stopped.join(', ')}` : '';
      appendLog(`[程序已停止] 已释放运行资源${stopped}`, 'success');
      setProgramState('idle');
    } else {
      setProgramState('error');
      appendLog(
        `[停止失败] ${result.error || '目标进程仍在运行'}`,
        'error'
      );
      result.remaining?.slice(0, 8).forEach((process) => appendLog(process, 'error'));
    }

    if (result.launcher?.started) {
      appendLog(
        `[系统] 已恢复 CocoPi 桌面启动器${result.launcher.command ? `: ${result.launcher.command}` : ''}`,
        'debug'
      );
      result.launcher.processes?.slice(0, 4).forEach((process) => appendLog(process, 'info'));
      if (result.launcher.screen_clear?.skipped) {
        appendLog('[显示] 显示层由 launcher.service 统一恢复', 'info');
      } else if (result.launcher.screen_clear?.ok) {
        appendLog('[显示] 已清除旧错误画面并重新初始化显示层', 'success');
      } else if (result.launcher.screen_clear) {
        appendLog(
          `[显示] 清屏失败: ${
            result.launcher.screen_clear.error ||
            result.launcher.screen_clear.output ||
            '未知错误'
          }`,
          'error'
        );
      }
    } else if (result.launcher?.error) {
      appendLog(`[系统] 桌面启动器恢复失败: ${result.launcher.error}`, 'error');
      if (result.launcher.output) {
        result.launcher.output
          .trim()
          .split(/\r?\n/)
          .slice(-20)
          .forEach((line) => appendLog(line, 'error'));
      }
      result.launcher.display_remaining?.slice(0, 8).forEach((process) => {
        appendLog(`[显示占用] ${process}`, 'error');
      });
      result.launcher.attempts?.forEach((attempt) => {
        appendLog(
          `[launcher] ${attempt.command}: ${
            attempt.error || (attempt.processes?.join(' | ') || '进程未保持运行')
          }`,
          'error'
        );
        if (attempt.log) {
          attempt.log
            .trim()
            .split(/\r?\n/)
            .slice(-20)
            .forEach((line) => appendLog(line, 'error'));
        }
      });
      if (result.launcher.log) {
        result.launcher.log
          .trim()
          .split(/\r?\n/)
          .slice(-20)
          .forEach((line) => appendLog(line, 'error'));
      }
    }
    return true;
  };

  const handleSendCommand = async (cmdText) => {
    const rawCommand = (cmdText ?? replInput).trim();
    if (!rawCommand) return;
    setReplInput('');

    if (connStatus !== 'connected') {
      appendLog('请先连接 CocoPi 设备！', 'error');
      return;
    }

    if (rawCommand === 'clear') {
      setTerminalLogs([]);
      return;
    }

    appendLog(`${deviceCwdRef.current} # ${rawCommand}`, 'cmd');

    if (connType === 'usb-webusb' && adbClientRef.current) {
      const nativeCommand = buildNativeShellCommand(rawCommand, deviceCwdRef.current);
      let streamedAny = false;
      const output = await adbClientRef.current.execShellCommand(nativeCommand, 20_000, {
        silent: true,
        onOutput: (line) => {
          streamedAny = true;
          appendLog(line, 'shell');
        }
      });
      const parsed = parseNativeShellOutput(output);
      setDeviceWorkingDirectory(parsed.cwd);
      if (!streamedAny) {
        appendShellOutput(parsed.output, parsed.trailing, parsed.exitCode);
      } else if (parsed.trailing) {
        appendShellOutput('', parsed.trailing, parsed.exitCode);
      }
      return;
    }

    if (connType === 'ssh-real' && sshClientRef.current) {
      try {
        const nativeCommand = buildNativeShellCommand(rawCommand, deviceCwdRef.current);
        const result = await sshClientRef.current.execShellCommand(
          nativeCommand,
          30_000,
          { silent: true }
        );
        const parsed = parseNativeShellOutput(result.output);
        setDeviceWorkingDirectory(parsed.cwd);
        appendShellOutput(parsed.output, parsed.trailing, parsed.exitCode);
      } catch (error) {
        appendLog(`[SSH Shell 执行失败] ${error.message}`, 'error');
      }
      return;
    }

  };

  const handleStopDeviceProgram = async () => {
    if (connStatus !== 'connected') return;
    setProgramState('stopping');
    stopSettledRef.current = false;
    appendLog('[操作] 正在停止用户程序并恢复 CocoPi 桌面...', 'debug');

    if (connType === 'usb-webusb' && adbClientRef.current) {
      const output = await adbClientRef.current.stopRunningPrograms(runningPidRef.current);
      if (!handleStopResult(output)) {
        setProgramState('error');
        appendLog('[停止失败] 设备未返回停止结果，请查看终端日志。', 'error');
      }
      return;
    }

    if (connType === 'ssh-real' && sshClientRef.current) {
      const output = await sshClientRef.current.stopRunningPrograms(
        runningPidRef.current
      );
      if (!handleStopResult(output)) {
        setProgramState('error');
        appendLog('[停止失败] SSH 设备未返回停止结果，请查看终端日志。', 'error');
      }
      return;
    }

    setProgramState('error');
  };

  const handleDisconnect = async () => {
    const hasRunningProgram =
      programState === 'running' || Boolean(runningPidRef.current);
    if (hasRunningProgram) {
      appendLog('[系统] 检测到运行中的程序，断开前先停止程序...', 'debug');
      await handleStopDeviceProgram();
      const deadline = Date.now() + 25_000;
      while (!stopSettledRef.current && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!stopSettledRef.current) {
        appendLog('[断开取消] 运行中的程序未能停止，请稍后重试。', 'error');
        return;
      }
    }

    clearAllTimers();

    if (adbClientRef.current) {
      await adbClientRef.current.close();
      adbClientRef.current = null;
    }
    if (sshClientRef.current) {
      sshClientRef.current.close();
      sshClientRef.current = null;
    }

    setConnStatus('disconnected');
    setConnType(null);
    setProgramState('idle');
    runningPidRef.current = null;
    deviceCwdRef.current = '/root';
    setDeviceCwd('/root');
    setDeviceInfo((prev) => ({
      ...prev,
      portName: t('device.disconnected')
    }));
    appendLog('[系统] 已安全断开设备连接。', 'info');
  };

  const handleDeploymentOutput = (output, targetFile) => {
    const result = parseDeploymentResult(output);
    if (!result) return false;

    deploymentSettledRef.current = true;
    if (deploymentTimeoutRef.current) {
      clearTimeout(deploymentTimeoutRef.current);
      timersRef.current = timersRef.current.filter(
        (timerId) => timerId !== deploymentTimeoutRef.current
      );
      deploymentTimeoutRef.current = null;
    }

    if (!result.ok) {
      setProgramState('error');
      const effectiveError =
        summarizeDeviceOutput(
          [
            result.error || '',
            ...(result.processes || []),
            result.output || ''
          ].join('\n')
        ) || result.error || '未知设备错误';
      setLastRunError(effectiveError);
      appendLog(
        `[真机运行失败 · ${result.stage || 'unknown'}] ${result.error || '未知错误'}`,
        'error'
      );
      if (result.processes?.length) {
        result.processes.slice(0, 8).forEach((process) => appendLog(process, 'error'));
      }
      if (result.output) {
        result.output
          .trim()
          .split(/\r?\n/)
          .filter(Boolean)
          .slice(-20)
          .forEach((line) => appendLog(line, 'error'));
      }
      return true;
    }

    setLastRunError('');
    if (result.python) {
      appendLog(`[真机运行时] ${result.python}`, 'info');
    }
    setProgramState(result.running === false ? 'idle' : 'running');
    runningPidRef.current = result.running === false ? null : Number(result.pid) || null;

    if (result.running === false) {
      appendLog(`[真机运行完成] ${result.target || `/root/${targetFile}`} 已正常结束`, 'success');
      if (result.launcher?.started) {
        appendLog('[系统] 程序结束后已恢复 CocoPi 桌面启动器', 'debug');
      } else if (result.launcher?.error) {
        appendLog(`[系统] 程序结束后恢复桌面失败: ${result.launcher.error}`, 'error');
      }
    } else {
      appendLog(
        `[真机运行成功] ${result.target || `/root/${targetFile}`} 已在设备后台启动${
          result.pid ? `，PID ${result.pid}` : ''
        }`,
        'success'
      );
    }
    if (result.output) {
      result.output
        .trim()
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(-20)
        .forEach((line) => appendLog(line, 'device'));
    }
    return true;
  };

  // 进入 MaixPy 开发模式后启动脚本，避免 launcher/maixapp 占用屏幕和摄像头。
  const executeCodeOnDevice = async (
    codeToRun,
    customFilename = null,
    executionOptions = {}
  ) => {
    const targetFile = String(customFilename || 'user_latest_code.py').replace(
      /[^a-zA-Z0-9_.-]/g,
      '_'
    );

    if (!executionOptions.useExistingFile) {
      const validation = validateMaixPyCode(codeToRun);
      validation.warnings.forEach((warning) =>
        appendLog(`[静态检查] ${warning}`, 'debug')
      );
      if (!validation.valid) {
        const errorText = validation.errors.join('\n');
        setProgramStateUnlessActive('error');
        setLastRunError(errorText);
        appendLog(`[静态检查失败]\n${errorText}`, 'error');
        return;
      }
    }

    if (connStatus !== 'connected') {
      setActiveSection('connect');
      document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' });
      appendLog('[提示] 设备尚未连接，请先在“设备连接管理中心”连接 CocoPi 后再运行代码。', 'error');
      return;
    }

    setProgramState('deploying');
    deploymentSettledRef.current = false;
    appendLog('[真机下发] 正在进入开发模式、释放屏幕资源并启动脚本...', 'info');

    if (connType === 'usb-webusb' && adbClientRef.current) {
      try {
        const output = await adbClientRef.current.deployAndRunMaixProgram(
          codeToRun,
          targetFile,
          runningPidRef.current,
          executionOptions
        );
        if (!handleDeploymentOutput(output, targetFile)) {
          throw new Error(
            `设备未返回启动状态。设备输出: ${output.trim().slice(-1000) || '(空)'}`
          );
        }
      } catch (error) {
        setProgramState('error');
        appendLog(`[WebUSB 执行异常] ${error.message}`, 'error');
      }
      return;
    }

    if (connType === 'ssh-real' && sshClientRef.current) {
      try {
        const output = await sshClientRef.current.deployAndRunMaixProgram(
          codeToRun,
          targetFile,
          runningPidRef.current,
          executionOptions
        );
        if (!handleDeploymentOutput(output, targetFile)) {
          throw new Error(
            `设备未返回启动状态。SSH 输出: ${output.trim().slice(-1000) || '(空)'}`
          );
        }
      } catch (error) {
        setProgramState('error');
        appendLog(`[SSH 执行异常] ${error.message}`, 'error');
      }
      return;
    }

    appendLog('[真机运行失败] 当前连接类型不支持代码下发。', 'error');
    setProgramState('error');
  };

  // ==========================================
  // 7. AI 编程助手：按您的参考代码结构生成 MaixPy v4 程序
  // ==========================================
  const handleAiGenerateCode = async (autoRunAfterGen = false) => {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      appendLog('[AI 编程] 请先输入您的自然语言编程指令！', 'error');
      return;
    }

    setIsGeneratingAi(true);
    appendLog(`[AI 编程助手] 正在按官方模板生成代码: "${prompt}" ...`, 'info');

    let generatedPython = '';

    try {
      const result = await requestMaixPyCode(prompt);
      generatedPython = result.code;
      const validation = result.validation || validateMaixPyCode(generatedPython);
      appendLog(
        `[AI 编程助手] 服务端代理生成成功${result.model ? `，模型: ${result.model}` : ''}！`,
        'success'
      );
      if (result.templates?.length) {
        appendLog(`[知识库] 参考样例: ${result.templates.join('、')}`, 'info');
      }
      validation.warnings.forEach((warning) =>
        appendLog(`[静态检查] ${warning}`, 'debug')
      );
      if (!validation.valid) {
        const errorText = validation.errors.join('\n');
        setProgramState('error');
        setLastRunError(errorText);
        appendLog(`[AI 代码静态检查失败]\n${errorText}`, 'error');
        return;
      }
      setLastRunError('');

      if (generatedPython) {
        setEditableCode(generatedPython);
        if (autoRunAfterGen) {
          await executeCodeOnDevice(generatedPython, 'user_latest_code.py');
        }
      }
    } catch (err) {
      appendLog(`[AI 接口提示，已使用内置模板生成] ${err.message}`, 'error');
      generatedPython = generateLocalMaixPyFallback(prompt);
      setEditableCode(generatedPython);
      if (autoRunAfterGen) {
        await executeCodeOnDevice(generatedPython, 'user_latest_code.py');
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAiRepairCode = async (autoRun = false) => {
    if (isProgramBusy) {
      appendLog('[AI 修复] 设备正在部署或停止，请等待操作完成。', 'error');
      return;
    }
    if (!lastRunError) {
      appendLog('[AI 修复] 当前没有可用的设备错误信息。', 'error');
      return;
    }

    setIsGeneratingAi(true);
    appendLog('[AI 修复] 正在根据有效设备错误和知识库修复代码...', 'info');

    try {
      const result = await requestMaixPyCode(
        aiPrompt.trim() || '修复当前 CocoPi 程序在真机上的错误',
        {
          previousCode: editableCode,
          deviceError: lastRunError
        }
      );
      const validation = result.validation || validateMaixPyCode(result.code);
      if (!validation.valid) {
        const errorText = validation.errors.join('\n');
        setProgramStateUnlessActive('error');
        setLastRunError(errorText);
        appendLog(`[AI 修复后静态检查仍失败]\n${errorText}`, 'error');
        return;
      }

      setEditableCode(result.code);
      setProgramStateUnlessActive('idle');
      setLastRunError('');
      appendLog('[AI 修复] 已生成通过静态检查的新版本。', 'success');
      if (autoRun) {
        await executeCodeOnDevice(result.code, 'user_latest_code.py');
      }
    } catch (error) {
      appendLog(`[AI 修复失败] ${error.message}`, 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const qrCode = useMemo(
    () => createWifiQrMatrix(qrSsid, qrPassword),
    [qrSsid, qrPassword]
  );

  // ==========================================
  // 8. 视图层
  // ==========================================
  const focusPart = (partId, position) => {
    const part = HARDWARE_PARTS[partId];
    if (!part) return;
    setSelectedPart(part);
    setTargetCamPos([...(position || part.camPos)]);
  };

  const copyCode = () => {
    navigator.clipboard
      ?.writeText(editableCode)
      .then(() => {
        setCopiedCode(true);
        registerTimer(() => setCopiedCode(false), 2000);
      })
      .catch(() => {
        appendLog('[复制失败] 浏览器拒绝了剪贴板访问，请手动选择代码复制。', 'error');
      });
  };

  const handleSaveToLocal = () => {
    try {
      localStorage.setItem('cocopi-portal-saved-code', editableCode);
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, '');
      const filename = `cocopi-${activeProgram?.id || 'program'}-${timestamp}.py`;
      const blob = new Blob([editableCode], {
        type: 'text/x-python;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      appendLog(t('save.localSuccess'), 'success');
    } catch (error) {
      appendLog(`${t('save.failed')} ${error.message}`, 'error');
    }
  };

  const handleUploadCode = async () => {
    if (connStatus !== 'connected') {
      appendLog(t('upload.needsConnection'), 'error');
      setShowDeviceDrawer(true);
      return;
    }

    const validation = validateMaixPyCode(editableCode);
    if (!validation.valid) {
      const errorText = validation.errors.join('\n');
      setLastRunError(errorText);
      appendLog(`${t('upload.invalid')}\n${errorText}`, 'error');
      return;
    }

    const targetFile = 'user_latest_code.py';
    setIsUploading(true);
    try {
      let output = '';
      if (connType === 'usb-webusb' && adbClientRef.current) {
        output = await adbClientRef.current.uploadProgram(editableCode, targetFile);
      } else if (connType === 'ssh-real' && sshClientRef.current) {
        output = await sshClientRef.current.uploadProgram(editableCode, targetFile);
      } else {
        throw new Error(t('upload.needsConnection'));
      }
      const result = parseUploadProgramResult(output);
      if (!result?.ok) {
        throw new Error(result?.error || 'Upload result was not returned');
      }
      appendLog(
        t('upload.success', { target: result.target || `/root/${targetFile}` }),
        'success'
      );
    } catch (error) {
      appendLog(t('upload.failed', { error: error.message }), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestartDevice = async () => {
    if (connStatus !== 'connected') {
      appendLog(t('reboot.needsConnection'), 'error');
      setShowDeviceDrawer(true);
      return;
    }
    if (!window.confirm(t('reboot.confirm'))) return;

    setIsRestarting(true);
    try {
      const command =
        "nohup sh -c 'sleep 1; reboot' >/tmp/cocopi_reboot.log 2>&1 & " +
        "printf '__COCOPI_REBOOT_SCHEDULED__\\n'";
      if (connType === 'usb-webusb' && adbClientRef.current) {
        await adbClientRef.current.execShellCommand(command, 5_000, {
          silent: true
        });
      } else if (connType === 'ssh-real' && sshClientRef.current) {
        await sshClientRef.current.execShellCommand(command, 5_000, {
          silent: true
        });
      } else {
        throw new Error(t('reboot.needsConnection'));
      }
      appendLog(t('reboot.sent'), 'success');
      clearAllTimers();
      if (adbClientRef.current) {
        await adbClientRef.current.close().catch(() => {});
        adbClientRef.current = null;
      }
      if (sshClientRef.current) {
        sshClientRef.current.close();
        sshClientRef.current = null;
      }
      setConnStatus('disconnected');
      setConnType(null);
      setProgramState('idle');
      runningPidRef.current = null;
    } catch (error) {
      appendLog(t('reboot.failed', { error: error.message }), 'error');
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <header className="sticky top-0 z-40 border-b border-line/90 bg-surface/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-accent text-white shadow-[0_5px_14px_rgba(37,99,235,0.22)]">
              <Puzzle aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[16px] font-bold tracking-tight text-ink">CocoBlockly</span>
                <span className="hidden text-[12px] text-ink-dim sm:inline">
                  COCOPI MODULE
                </span>
              </div>
            </div>
          </div>

          <nav aria-label={t('nav.primary')} className="hidden items-center gap-7 md:flex">
            {APP_SECTIONS.map((nav) => {
              const Icon = nav.icon;
              return (
              <button
                key={nav.id}
                type="button"
                onClick={() => navigateToSection(nav.id)}
                aria-current={activeSection === nav.id ? 'true' : undefined}
                className={cx(
                  'relative flex items-center gap-2 py-1 text-[13px] font-semibold transition-colors',
                  activeSection === nav.id
                    ? 'text-ink after:absolute after:-bottom-[15px] after:left-0 after:right-0 after:h-[2px] after:bg-accent'
                    : 'text-ink-dim hover:text-ink'
                )}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {t(nav.labelKey)}
              </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowDeviceDrawer(true)}
              title={
                connStatus === 'connected'
                  ? deviceInfo.portName
                  : t('device.add')
              }
              className="flex min-h-9 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-3 text-[12px] font-semibold text-ink-soft hover:bg-surface-sunken"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              <span className="hidden xl:inline">{t('device.add')}</span>
              <span
                aria-hidden="true"
                className={cx(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  connStatus === 'connected'
                    ? 'bg-ok'
                    : connStatus === 'connecting'
                    ? 'bg-warn'
                    : 'bg-line-strong'
                )}
              />
            </button>
            <button
              type="button"
              onClick={handleSaveToLocal}
              title={t('actions.save')}
              className="hidden min-h-9 items-center gap-1.5 rounded-[var(--radius-control)] border border-line bg-surface px-2.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-sunken sm:inline-flex sm:px-3"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              <span className="hidden xl:inline">{t('actions.save')}</span>
            </button>
            <button
              type="button"
              onClick={handleUploadCode}
              disabled={connStatus !== 'connected' || isProgramBusy || !editableCode.trim()}
              title={t('actions.upload')}
              className="hidden min-h-9 items-center gap-1.5 rounded-[var(--radius-control)] border border-line bg-surface px-2.5 text-[12px] font-semibold text-ink-soft hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-45 sm:inline-flex sm:px-3"
            >
              <Upload aria-hidden="true" className="h-4 w-4" />
              <span className="hidden xl:inline">
                {isUploading ? t('actions.uploading') : t('actions.upload')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => executeCodeOnDevice(editableCode, 'user_latest_code.py')}
              disabled={connStatus !== 'connected' || isProgramBusy || !editableCode.trim()}
              title={t('actions.run')}
              className="hidden min-h-9 items-center gap-1.5 rounded-[var(--radius-control)] bg-accent px-2.5 text-[12px] font-semibold text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-45 md:inline-flex md:px-3.5"
            >
              <Play aria-hidden="true" className="h-4 w-4 fill-current" />
              <span className="hidden xl:inline">{t('actions.run')}</span>
            </button>
            <button
              type="button"
              onClick={handleRestartDevice}
              disabled={connStatus !== 'connected' || isProgramBusy}
              title={t('actions.restart')}
              className="hidden min-h-9 items-center gap-1.5 rounded-[var(--radius-control)] border border-warn-line bg-warn-soft px-2.5 text-[12px] font-semibold text-warn hover:bg-warn-hover disabled:cursor-not-allowed disabled:opacity-45 md:inline-flex md:px-3"
            >
              <RotateCw
                aria-hidden="true"
                className={cx('h-4 w-4', isRestarting && 'animate-spin')}
              />
              <span className="hidden xl:inline">
                {isRestarting ? t('actions.restarting') : t('actions.restart')}
              </span>
            </button>
            <label
              className="flex min-h-9 items-center gap-1.5 rounded-[var(--radius-control)] border border-line bg-surface px-2.5 text-ink-soft"
              title={t('language.label')}
            >
              <Languages aria-hidden="true" className="hidden h-4 w-4 shrink-0 sm:block" />
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label={t('language.label')}
                className="w-[82px] cursor-pointer bg-transparent text-[12px] font-semibold text-ink-soft outline-none sm:w-auto sm:max-w-[130px]"
              >
                <option value="zh-hans">{t('language.zhHans')}</option>
                <option value="zh-hant">{t('language.zhHant')}</option>
                <option value="en">{t('language.en')}</option>
              </select>
            </label>
            <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-warn-soft text-[12px] font-bold text-warn lg:inline-flex">
              C
            </span>
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="min-h-8 rounded-[6px] border border-line px-2 text-ink-soft md:hidden"
              aria-label={mobileNavOpen ? t('nav.close') : t('nav.open')}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? (
                <X aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Menu aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <nav
            aria-label={t('nav.mobile')}
            className="border-t border-line bg-surface px-4 py-2 md:hidden"
          >
            {APP_SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateToSection(item.id)}
                className={cx(
                  'block w-full rounded-[6px] px-3 py-2.5 text-left text-[14px] font-medium',
                  activeSection === item.id
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-soft hover:bg-surface-sunken'
                )}
              >
                <item.icon aria-hidden="true" className="h-4 w-4" />
                {t(item.labelKey)}
              </button>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={handleSaveToLocal}
                className={buttonStyles.secondary}
              >
                <Save aria-hidden="true" className="h-4 w-4" />
                {t('actions.save')}
              </button>
              <button
                type="button"
                onClick={handleUploadCode}
                disabled={connStatus !== 'connected' || isProgramBusy || !editableCode.trim()}
                className={buttonStyles.secondary}
              >
                <Upload aria-hidden="true" className="h-4 w-4" />
                {isUploading ? t('actions.uploading') : t('actions.upload')}
              </button>
              <button
                type="button"
                onClick={() => executeCodeOnDevice(editableCode, 'user_latest_code.py')}
                disabled={connStatus !== 'connected' || isProgramBusy || !editableCode.trim()}
                className={buttonStyles.primary}
              >
                <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                {t('actions.run')}
              </button>
              <button
                type="button"
                onClick={handleRestartDevice}
                disabled={connStatus !== 'connected' || isProgramBusy}
                className={buttonStyles.warnSoft}
              >
                <RotateCw
                  aria-hidden="true"
                  className={cx('h-4 w-4', isRestarting && 'animate-spin')}
                />
                {isRestarting ? t('actions.restarting') : t('actions.restart')}
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 sm:py-6">
        {activeSection === 'overview' && (
          <OverviewSection
            selectedPart={selectedPart}
            onSelectPart={setSelectedPart}
            targetCamPos={targetCamPos}
            onFocusPart={focusPart}
            zoomTrigger={zoomTrigger}
            onZoom={(type) => setZoomTrigger({ type, ts: Date.now() })}
            onResetView={() => setResetTrigger((n) => n + 1)}
            resetTrigger={resetTrigger}
          />
        )}

        {activeSection === 'blocks' && (
          <Suspense
            fallback={
              <div className="flex min-h-[420px] items-center justify-center rounded-[var(--radius-box)] border border-line bg-surface text-[13px] text-ink-dim">
                {t('editor.loading')}
              </div>
            }
          >
            <BlocklySection
              id="blocks-panel"
              code={editableCode}
              onCodeChange={setEditableCode}
              connStatus={connStatus}
              deviceInfo={deviceInfo}
              isProgramBusy={isProgramBusy}
              programState={programState}
              aiPrompt={aiPrompt}
              onAiPromptChange={setAiPrompt}
              onAiGenerate={handleAiGenerateCode}
              onAiGenerateAndRun={() => handleAiGenerateCode(true)}
              isGeneratingAi={isGeneratingAi}
              lastRunError={lastRunError}
              onAiRepair={handleAiRepairCode}
              onAiRepairAndRun={() => handleAiRepairCode(true)}
              activeProgram={activeProgram}
              onSelectProgram={(program) => {
                setActiveProgram(program);
                setEditableCode(program.python);
              }}
              onRunCode={(code) => executeCodeOnDevice(code, 'user_latest_code.py')}
              onStop={handleStopDeviceProgram}
              onOpenDevice={() => setShowDeviceDrawer(true)}
              deviceCwd={deviceCwd}
              terminalLogs={terminalLogs}
              terminalContainerRef={terminalContainerRef}
              onClearLogs={() => setTerminalLogs([])}
              onQuickCommand={handleSendCommand}
              replInput={replInput}
              onReplInputChange={setReplInput}
              onSendCommand={handleSendCommand}
            />
          </Suspense>
        )}
      </main>

      <footer className="mx-auto max-w-[1600px] px-4 pb-8 pt-2 text-[12px] text-ink-dim sm:px-6">
        {t('footer.connection')}
      </footer>

      <DeviceDrawer
        open={showDeviceDrawer}
        onClose={() => setShowDeviceDrawer(false)}
        connStatus={connStatus}
        deviceInfo={deviceInfo}
        connectionTab={connectionTab}
        onSelectConnectionTab={setConnectionTab}
        isSecureContext={isSecureContext}
        onAdbConnect={handleAdbWiredConnect}
        sshIpInput={sshIpInput}
        onSshIpChange={setSshIpInput}
        sshPortInput={sshPortInput}
        onSshPortChange={setSshPortInput}
        sshUserInput={sshUserInput}
        onSshUserChange={setSshUserInput}
        sshPasswordInput={sshPasswordInput}
        onSshPasswordChange={setSshPasswordInput}
        sshError={sshError}
        onSshConnect={handleSshConnect}
        onOpenQrModal={() => {
          setShowDeviceDrawer(false);
          setShowQrModal(true);
        }}
        isProgramBusy={isProgramBusy}
        onStopProgram={handleStopDeviceProgram}
        onDisconnect={async () => {
          await handleDisconnect();
          setShowDeviceDrawer(false);
        }}
      />

      {showQrModal && (
        <QrModal
          qrCode={qrCode}
          ssid={qrSsid}
          password={qrPassword}
          onSsidChange={setQrSsid}
          onPasswordChange={setQrPassword}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}
