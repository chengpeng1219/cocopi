import { lazy, Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { YaWebAdbClient } from './lib/yaWebAdbClient.js';
import {
  buildTelemetryProbe,
  buildFileListProbe,
  parseTelemetryOutput,
  parseFileListOutput,
  formatDeviceFileTime
} from './lib/deviceProbes.js';
import { createWifiQrMatrix } from './lib/qr.js';
import { requestMaixPyCode } from './lib/aiClient.js';
import {
  validateMaixPyCode,
  summarizeDeviceOutput,
  APP_READY_MARKER
} from './lib/maixpyValidator.js';
import {
  parseDeploymentResult,
  parseStopResult,
  buildNativeShellCommand,
  parseNativeShellOutput,
  buildShellCommandScript,
  parseShellCommandResult,
  buildCompressedWsScript,
  buildWifiProgramScript,
  buildWifiStopScript
} from './lib/maixRuntime.js';
import {
  Cpu,
  Wifi,
  Usb,
  Play,
  Square,
  Terminal,
  Folder,
  FileCode,
  AlertCircle,
  Code2,
  QrCode,
  Activity,
  Copy,
  Check,
  Trash2,
  Send,
  Smartphone,
  Rotate3d,
  Sparkles,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Wand2,
  Loader2,
  StopCircle
} from 'lucide-react';
import { HARDWARE_PARTS } from './data/hardwareParts.js';
import { MAIXPY_PROGRAMS } from './data/maixpyPrograms.js';
import { generateLocalMaixPyFallback } from './data/maixpy.js';

const CocoPiReal3DViewer = lazy(() => import('./components/HardwareViewer.jsx'));

// ==========================================
// 主应用组件
// ==========================================
export default function App() {
  const [activeSection, setActiveSection] = useState('overview');

  // 3D 模型交互状态
  const [selectedPart, setSelectedPart] = useState(HARDWARE_PARTS.screen);
  const [targetCamPos, setTargetCamPos] = useState([2.8, 1.8, 5.2]);
  const [zoomTrigger, setZoomTrigger] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // 连接状态 ('usb-webusb' | 'wifi-real')
  const [connectionTab, setConnectionTab] = useState('usb');
  const [connStatus, setConnStatus] = useState('disconnected');
  const [connType, setConnType] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({
    portName: '未连接',
    ip: '192.168.1.108',
    wsPort: '8181'
  });

  const [wifiIpInput, setWifiIpInput] = useState('192.168.1.108');
  const [wifiPortInput, setWifiPortInput] = useState('8181');
  const [wifiError, setWifiError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSsid, setQrSsid] = useState('SmartLab_5G');
  const [qrPassword, setQrPassword] = useState('cocopi2026');

  const [telemetry, setTelemetry] = useState({
    cpu: null,
    npu: null,
    ram: null,
    temp: null
  });

  const [deviceFiles, setDeviceFiles] = useState([
    { name: 'user_latest_code.py', updated: '官方标准运行入口' },
    { name: 'ws_agent.py', updated: '8181无线守护进程' }
  ]);

  const [terminalLogs, setTerminalLogs] = useState([
    {
      time: '11:00:00',
      type: 'info',
      text: 'CocoPi 实训平台已就绪。沙盒代码已 100% 替换为您的官方 MaixPy v4 参考源码 (display.Display / camera.Camera)！'
    }
  ]);
  const [replInput, setReplInput] = useState('');
  const [deviceCwd, setDeviceCwd] = useState('/root');

  // 编程沙盒与 AI 编程状态
  const [activeProgram, setActiveProgram] = useState(MAIXPY_PROGRAMS[0]);
  const [editableCode, setEditableCode] = useState(MAIXPY_PROGRAMS[0].python);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [lastRunError, setLastRunError] = useState('');

  const wsRef = useRef(null);
  const adbClientRef = useRef(null);
  const terminalContainerRef = useRef(null);
  const timersRef = useRef([]);
  const deploymentTimeoutRef = useRef(null);
  const stopTimeoutRef = useRef(null);
  const deploymentSettledRef = useRef(false);
  const stopSettledRef = useRef(false);
  const runningPidRef = useRef(null);
  const deviceCwdRef = useRef('/root');
  const isSecureContext =
    typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false;

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
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setTerminalLogs((prev) => [...prev.slice(-150), { time: timeStr, type, text }]);
  };

  const sendCompressedWsSource = async (source) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('无线设备未连接');
    }
    wsRef.current.send(await buildCompressedWsScript(source));
  };

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      if (wsRef.current) wsRef.current.close();
      if (adbClientRef.current) adbClientRef.current.close();
    };
  }, []);

  const applyFileListOutput = (output) => {
    const files = parseFileListOutput(output);
    if (!files) return false;
    setDeviceFiles(
      files.map((file) => ({
        ...file,
        updated: formatDeviceFileTime(file.mtime)
      }))
    );
    return true;
  };

  const pollDeviceTelemetry = async () => {
    if (
      connStatus === 'connected' &&
      connType === 'wifi-real' &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(buildTelemetryProbe());
    }
  };

  const refreshDeviceFiles = async () => {
    if (connStatus !== 'connected') {
      appendLog('[文件管理] 请先连接 CocoPi 设备。', 'error');
      return;
    }

    if (connType === 'usb-webusb' && adbClientRef.current) {
      try {
        const files = await adbClientRef.current.listFiles('/root');
        setDeviceFiles(
          files.map((file) => ({
            ...file,
            updated: formatDeviceFileTime(file.mtime)
          }))
        );
      } catch (error) {
        appendLog(`[文件管理] 未能读取 /root 目录: ${error.message}`, 'error');
      }
      return;
    }

    if (connType === 'wifi-real' && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(buildFileListProbe());
    }
  };

  useEffect(() => {
    if (connStatus !== 'connected' || connType !== 'wifi-real') {
      setTelemetry({ cpu: null, npu: null, ram: null, temp: null });
      return;
    }

    let stopped = false;
    let polling = false;
    const runPoll = async () => {
      if (stopped || polling) return;
      polling = true;
      try {
        await pollDeviceTelemetry();
      } finally {
        polling = false;
      }
    };

    const initialTimer = setTimeout(runPoll, 2500);
    const interval = setInterval(runPoll, connType === 'usb-webusb' ? 10_000 : 5000);
    return () => {
      stopped = true;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [connStatus, connType]);

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

      setConnStatus('connecting');
      appendLog('[ADB 有线] 请在弹出的浏览器窗口中选择 CocoPi 设备...');

      const client = new YaWebAdbClient({
        onLog: appendLog,
        onDisconnect: () => {
          adbClientRef.current = null;
          setConnStatus('disconnected');
          setConnType(null);
          setIsRunningCode(false);
          runningPidRef.current = null;
          appendLog('[ADB 有线] 设备连接已断开', 'error');
        }
      });
      adbClientRef.current = client;

      const info = await client.connect();
      setConnStatus('connected');
      setConnType('usb-webusb');
      runningPidRef.current = null;
      deviceCwdRef.current = '/root';
      setDeviceCwd('/root');
      setDeviceInfo((prev) => ({
        ...prev,
        portName: `ADB 有线 (${info.name || info.serial || 'CocoPi'})`
      }));
      appendLog(
        `[ADB 有线] ya-webadb 已连接: ${info.name || info.serial}${info.banner ? ` | ${info.banner}` : ''}`,
        'success'
      );
    } catch (err) {
      if (adbClientRef.current) {
        await adbClientRef.current.close();
        adbClientRef.current = null;
      }
      setConnStatus('disconnected');
      setConnType(null);
      appendLog(`[ADB 连接取消或失败] ${err.message}`, 'error');
    }
  };

  // Wi-Fi 8181 WebSocket 连接
  const handleWifiConnect = () => {
    setWifiError('');
    const cleanIp = wifiIpInput.trim();
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    const portNum = Number(wifiPortInput);

    if (!ipv4Regex.test(cleanIp) && cleanIp !== 'localhost') {
      setWifiError('请输入合法的 IPv4 地址（例如 192.168.1.108）');
      return;
    }
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      setWifiError('端口号需为 1 ~ 65535 之间的整数（默认 8181）');
      return;
    }
    if (window.location.protocol === 'https:') {
      setWifiError(
        'HTTPS 页面无法直接连接板端的 ws:// 8181。请使用局域网 HTTP 页面，或为板端服务配置 WSS 反向代理。'
      );
      return;
    }

    clearAllTimers();
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
    }

    setConnStatus('connecting');
    const wsUrl = `ws://${cleanIp}:${portNum}`;
    appendLog(`[Wi-Fi 无线] 正在连接 ${wsUrl} ...`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const timeoutId = registerTimer(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          try {
            ws.close();
          } catch (_) {}
          setConnStatus('disconnected');
          appendLog(`[连接超时] 未能连接至 ${wsUrl}，请确认板端已启动 /root/ws_agent.py。`, 'error');
        }
      }, 4200);

      ws.onopen = async () => {
        clearTimeout(timeoutId);
        setConnStatus('connected');
        setConnType('wifi-real');
        runningPidRef.current = null;
        deviceCwdRef.current = '/root';
        setDeviceCwd('/root');
        setDeviceInfo({
          ip: cleanIp,
          wsPort: String(portNum),
          portName: `Wi-Fi (${cleanIp}:${portNum})`
        });
        appendLog('[Wi-Fi 无线] 握手成功！已连上 CocoPi 真机环境。', 'success');
        try {
          await sendCompressedWsSource(
            buildShellCommandScript(
              'printf "[CocoPi 真机] "; uname -n; printf "内核: "; uname -r',
              '/root',
              10
            )
          );
          ws.send(buildFileListProbe());
          ws.send(buildTelemetryProbe());
        } catch (error) {
          appendLog(`[Wi-Fi 初始化] ${error.message}`, 'error');
        }
      };

      ws.onmessage = (event) => {
        const output = String(event.data || '').trim();
        if (output) {
          if (handleStopResult(output)) {
            return;
          }
          if (handleShellCommandResult(output)) {
            return;
          }
          if (handleDeploymentOutput(output, 'user_latest_code.py')) {
            return;
          }
          const metrics = parseTelemetryOutput(output);
          if (metrics) {
            setTelemetry(metrics);
            return;
          }
          if (applyFileListOutput(output)) {
            return;
          }
          output.split('\n').forEach((line) => appendLog(line, 'device'));
        }
      };

      ws.onclose = () => {
        clearTimeout(timeoutId);
        setConnStatus('disconnected');
        setConnType(null);
      };
    } catch (err) {
      setConnStatus('disconnected');
      appendLog(`[WebSocket 错误] ${err.message}`, 'error');
    }
  };

  const handleDisconnect = async () => {
    clearAllTimers();

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }

    if (adbClientRef.current) {
      await adbClientRef.current.close();
      adbClientRef.current = null;
    }

    setConnStatus('disconnected');
    setConnType(null);
    setIsRunningCode(false);
    runningPidRef.current = null;
    deviceCwdRef.current = '/root';
    setDeviceCwd('/root');
    setDeviceInfo((prev) => ({ ...prev, portName: '未连接' }));
    appendLog('[系统] 已安全断开设备连接。', 'info');
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
      stdoutText.split(/\r?\n/).forEach((line) => appendLog(line, 'device'));
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

  const handleShellCommandResult = (output) => {
    const result = parseShellCommandResult(output);
    if (!result) return false;

    setDeviceWorkingDirectory(result.cwd);
    if (!result.ok) {
      appendLog(`[Shell] ${result.error || '命令执行失败'}`, 'error');
      appendShellOutput(result.stdout, result.stderr, null);
      return true;
    }

    appendShellOutput(result.stdout, result.stderr, result.returncode);
    return true;
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

    setIsRunningCode(false);

    if (result.program_stopped || result.ok) {
      runningPidRef.current = null;
      setDeviceFiles((prev) =>
        prev.map((file) =>
          file.name === 'user_latest_code.py' ? { ...file, updated: '已停止' } : file
        )
      );
      const stopped = result.stopped?.length ? `，PID: ${result.stopped.join(', ')}` : '';
      appendLog(`[程序已停止] 已释放运行资源${stopped}`, 'success');
    }

    if (!result.ok && !result.program_stopped) {
      appendLog(
        `[停止失败] ${result.error || '目标进程仍在运行'}`,
        'error'
      );
      result.remaining?.slice(0, 8).forEach((process) => appendLog(process, 'error'));
    }

    if (result.launcher?.started) {
      appendLog(
        `[系统] 已恢复 CocoPi 桌面启动器${result.launcher.command ? `: ${result.launcher.command}` : ''}`,
        'info'
      );
      result.launcher.processes?.slice(0, 4).forEach((process) => appendLog(process, 'info'));
      if (result.launcher.screen_clear?.ok) {
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
      const output = await adbClientRef.current.execShellCommand(nativeCommand, 20_000, {
        silent: true
      });
      const parsed = parseNativeShellOutput(output);
      setDeviceWorkingDirectory(parsed.cwd);
      appendShellOutput(parsed.output, parsed.trailing, parsed.exitCode);
      return;
    }

    if (connType === 'wifi-real' && wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        await sendCompressedWsSource(
          buildShellCommandScript(rawCommand, deviceCwdRef.current, 30)
        );
      } catch (error) {
        appendLog(`[Shell 传输失败] ${error.message}`, 'error');
      }
    }
  };

  const handleStopDeviceProgram = async () => {
    if (connStatus !== 'connected') return;
    stopSettledRef.current = false;
    appendLog('[操作] 正在停止用户程序并恢复 CocoPi 桌面...', 'info');

    if (connType === 'usb-webusb' && adbClientRef.current) {
      const output = await adbClientRef.current.stopRunningPrograms(runningPidRef.current);
      if (!handleStopResult(output)) {
        appendLog('[停止失败] 设备未返回停止结果，请查看终端日志。', 'error');
      }
      return;
    }

    if (connType === 'wifi-real' && wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        await sendCompressedWsSource(buildWifiStopScript());
      } catch (error) {
        appendLog(`[停止命令传输失败] ${error.message}`, 'error');
        return;
      }
      if (!stopSettledRef.current) {
        if (stopTimeoutRef.current) {
          clearTimeout(stopTimeoutRef.current);
        }
        stopTimeoutRef.current = registerTimer(() => {
          stopTimeoutRef.current = null;
          if (!stopSettledRef.current) {
            appendLog(
              '[停止超时] 未收到设备返回结果，请检查板端 ws_agent.py 是否仍在响应。',
              'error'
            );
          }
        }, 15_000);
      }
    }
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

    setIsRunningCode(false);
    if (!result.ok) {
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
    runningPidRef.current = result.running === false ? null : Number(result.pid) || null;
    const actualTargetName =
      String(result.target || '').split('/').filter(Boolean).pop() || targetFile;
    setDeviceFiles((prev) => {
      const rest = prev.filter((file) => file.name !== actualTargetName);
      return [
        {
          name: actualTargetName,
          updated: result.running === false ? '执行完成' : '正在运行',
          mtime: Date.now() / 1000
        },
        ...rest
      ];
    });
    if (result.running === false) {
      appendLog(`[真机运行完成] ${result.target || `/root/${targetFile}`} 已正常结束`, 'success');
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
    saveToRoot = true,
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
        appendLog(`[静态检查] ${warning}`, 'info')
      );
      if (!validation.valid) {
        const errorText = validation.errors.join('\n');
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

    setIsRunningCode(true);
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
        appendLog(`[WebUSB 执行异常] ${error.message}`, 'error');
      } finally {
        setIsRunningCode(false);
        if (saveToRoot) refreshDeviceFiles();
      }
      return;
    }

    if (connType === 'wifi-real' && wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        await sendCompressedWsSource(buildWifiProgramScript(codeToRun, targetFile));
      } catch (error) {
        appendLog(`[真机下发失败] ${error.message}`, 'error');
        setIsRunningCode(false);
        return;
      }
      if (!deploymentSettledRef.current) {
        if (deploymentTimeoutRef.current) {
          clearTimeout(deploymentTimeoutRef.current);
        }
        deploymentTimeoutRef.current = registerTimer(() => {
          deploymentTimeoutRef.current = null;
          if (!deploymentSettledRef.current) {
            setIsRunningCode(false);
            appendLog(
              '[真机运行超时] 未收到 ws_agent.py 返回的启动状态，请检查板端代理是否允许执行 subprocess 和开发模式切换。',
              'error'
            );
          }
        }, 20_000);
      }
      return;
    }

    appendLog('[真机运行失败] 当前连接类型不支持代码下发。', 'error');
    setIsRunningCode(false);
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
        appendLog(`[静态检查] ${warning}`, 'info')
      );
      if (!validation.valid) {
        const errorText = validation.errors.join('\n');
        setLastRunError(errorText);
        appendLog(`[AI 代码静态检查失败]\n${errorText}`, 'error');
        return;
      }
      setLastRunError('');

      if (generatedPython) {
        setEditableCode(generatedPython);
        if (autoRunAfterGen) {
          await executeCodeOnDevice(generatedPython, true, 'user_latest_code.py');
        }
      }
    } catch (err) {
      appendLog(`[AI 接口提示，已使用内置模板生成] ${err.message}`, 'error');
      generatedPython = generateLocalMaixPyFallback(prompt);
      setEditableCode(generatedPython);
      if (autoRunAfterGen) {
        await executeCodeOnDevice(generatedPython, true, 'user_latest_code.py');
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAiRepairCode = async (autoRun = false) => {
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
        setLastRunError(errorText);
        appendLog(`[AI 修复后静态检查仍失败]\n${errorText}`, 'error');
        return;
      }

      setEditableCode(result.code);
      setLastRunError('');
      appendLog('[AI 修复] 已生成通过静态检查的新版本。', 'success');
      if (autoRun) {
        await executeCodeOnDevice(result.code, true, 'user_latest_code.py');
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* ==================== 顶部导航栏（蓝白浅色） ==================== */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-blue-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">CocoPi</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  AI 视觉硬件实训平台
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                全自由度 3D 缩放/旋转 · ADB Interface 直连 · 官方 user_latest_code.py 标准沙盒
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {[
              { id: 'overview', label: '3D 实体硬件仿真' },
              { id: 'connect', label: '设备连接管理' },
              { id: 'tutorials', label: '官方代码 + AI 编程沙盒' }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => {
                  setActiveSection(nav.id);
                  document.getElementById(nav.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeSection === nav.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setActiveSection('connect');
                document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                connStatus === 'connected'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : connStatus === 'connecting'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connStatus === 'connected'
                    ? 'bg-emerald-500 animate-ping'
                    : connStatus === 'connecting'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-slate-400'
                }`}
              />
              <span>
                {connStatus === 'connected'
                  ? deviceInfo.portName
                  : connStatus === 'connecting'
                  ? '正在连接...'
                  : '设备未连接'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* ==================== 1. 全自由度可缩放/可旋转背视图 3D 硬件探索 ==================== */}
        <section
          id="overview"
          className="rounded-3xl bg-white border border-blue-100 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Rotate3d className="w-4 h-4" />
              OrbitControls 全自由度相机 · 支持滚轮缩放与 360° 翻转背视图
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              CocoPi 智能硬件{' '}
              <span className="text-blue-600">全三维实体仿真模型</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              搭载 <strong className="text-slate-900">OrbitControls</strong> 工业级三维控制器：您可以<strong className="text-blue-600">滚动鼠标滚轮自由放大/缩小细节</strong>，按住左键直接 <strong className="text-blue-600">180° 翻转到背面查看调焦摄像头与 P0~P3/A0~A3 丝印</strong>，或点击下方部件卡片自动对焦。
            </p>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 border-2 border-blue-500 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {selectedPart.badge}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                  可点击 3D 模型任意部位
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{selectedPart.name}</h3>
              <div className="text-xs font-mono text-blue-900 bg-white px-3 py-2 rounded-xl border border-blue-200/80">
                {selectedPart.spec}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedPart.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'screen', label: '① 正视图：屏幕与扬声器' },
                { id: 'camera_back', label: '② 背视图：摄像头 & P0-P3' },
                { id: 'power_switch_left', label: '③ 左视图：电源开关 & M3-M6' },
                { id: 'right_io', label: '④ 右视图：扩展开关/电池/TypeC' },
                { id: 'top_sleep_ports', label: '⑤ 俯视图：返回(休眠)按钮' },
                { id: 'bottom_ports', label: '⑥ 底视图：M1/M2/UART/IIC' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => {
                    const part = HARDWARE_PARTS[btn.id];
                    setSelectedPart(part);
                    setTargetCamPos([...part.camPos]);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition flex items-center justify-between ${
                    selectedPart.id === btn.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <span className="truncate">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center space-y-3">
            <div className="w-full flex flex-wrap items-center justify-between gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { label: '正视图', pos: [0, 0, 6.2], part: 'screen' },
                  { label: '背视图', pos: [0, 0, -6.2], part: 'camera_back' },
                  { label: '左视图', pos: [-6.0, 0, 0], part: 'power_switch_left' },
                  { label: '右视图', pos: [6.0, 0, 0], part: 'right_io' },
                  { label: '俯视图', pos: [0, 5.8, 0.01], part: 'top_sleep_ports' },
                  { label: '底视图', pos: [0, -5.8, 0.01], part: 'bottom_ports' }
                ].map((v) => (
                  <button
                    key={v.label}
                    onClick={() => {
                      setSelectedPart(HARDWARE_PARTS[v.part]);
                      setTargetCamPos([...v.pos]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-white transition"
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setZoomTrigger({ type: 'in', ts: Date.now() })}
                  className="p-1 text-slate-600 hover:text-blue-600 transition"
                  title="放大模型"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomTrigger({ type: 'out', ts: Date.now() })}
                  className="p-1 text-slate-600 hover:text-blue-600 transition"
                  title="缩小模型"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setResetTrigger((n) => n + 1)}
                  className="p-1 text-slate-600 hover:text-blue-600 transition"
                  title="复位视角"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full relative">
              <Suspense
                fallback={
                  <div className="w-full h-[440px] rounded-3xl border border-blue-200 bg-[#ebf3ff] flex items-center justify-center text-sm font-semibold text-blue-700">
                    正在加载 3D 硬件模型...
                  </div>
                }
              >
                <CocoPiReal3DViewer
                  onSelectPart={(part) => setSelectedPart(part)}
                  targetCamPos={targetCamPos}
                  zoomTrigger={zoomTrigger}
                  resetTrigger={resetTrigger}
                />
              </Suspense>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-blue-200 text-xs font-semibold text-slate-600 shadow-2xs">
                  🖱️ 左键拖拽：360° 旋转看背面 · 滚轮：无级放大/缩小 · 右键拖拽：平移
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 2. 设备连接管理中心（单一 ADB Interface 直连 + 8181 无线） ==================== */}
        <section
          id="connect"
          className="rounded-3xl bg-white border border-blue-100 p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-900">CocoPi 设备连接管理中心</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  有线 ADB Interface 直连 · 无线 8181 WebSocket
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                支持通过 Type-C 数据线直接连接 <code className="text-blue-600 font-semibold">cocopi2 (ADB Interface)</code>，或通过局域网 Wi-Fi 连接。
              </p>
            </div>

            <div className="flex items-center gap-2">
              {connStatus === 'connected' && (
                <>
                  <button
                    onClick={handleStopDeviceProgram}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition"
                  >
                    <StopCircle className="w-4 h-4" />
                    停止设备运行中程序
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    断开连接
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setConnectionTab('usb')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
                    connectionTab === 'usb'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Usb className="w-4 h-4" />
                  有线连接 (ADB)
                </button>
                <button
                  onClick={() => setConnectionTab('wifi')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
                    connectionTab === 'wifi'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wifi className="w-4 h-4" />
                  无线连接 (Wi-Fi)
                </button>
              </div>

              {connectionTab === 'usb' ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      默认协议：ADB Interface
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      WebUSB 直连
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    将 Type-C 数据线插入机身右侧下沉式接口，点击下方按钮并在浏览器弹窗中选中 <strong className="text-slate-900">cocopi2</strong> 即可连接。
                  </p>

                  {!isSecureContext && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>当前页面不是安全上下文。WebUSB 需要 HTTPS 或 localhost 才能工作。</span>
                    </div>
                  )}

                  <button
                    onClick={handleAdbWiredConnect}
                    disabled={connStatus !== 'disconnected'}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <Usb className="w-4 h-4" />
                    连接 CocoPi 有线设备 (ADB Interface)
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-600">CocoPi 局域网 IP</label>
                      <input
                        type="text"
                        value={wifiIpInput}
                        onChange={(e) => setWifiIpInput(e.target.value)}
                        disabled={connStatus === 'connected'}
                        placeholder="192.168.1.108"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">端口</label>
                      <input
                        type="text"
                        value={wifiPortInput}
                        onChange={(e) => setWifiPortInput(e.target.value)}
                        disabled={connStatus === 'connected'}
                        placeholder="8181"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {wifiError && (
                    <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{wifiError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleWifiConnect}
                    disabled={connStatus !== 'disconnected'}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <Wifi className="w-4 h-4" />
                    连接 8181 无线服务
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-blue-50 text-xs font-semibold text-blue-700 border border-blue-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <QrCode className="w-4 h-4" />
                    生成摄像头扫码配网二维码
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    全志 V831 实时算力遥测
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-600">
                    {connStatus === 'connected'
                      ? Number.isFinite(telemetry.temp)
                        ? `SoC ${telemetry.temp}℃`
                        : '温度不可用'
                      : '待机'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    {
                      label: 'CPU 负载',
                      val:
                        connStatus === 'connected' && Number.isFinite(telemetry.cpu)
                          ? `${telemetry.cpu}%`
                          : '--'
                    },
                    {
                      label: 'NPU 占用',
                      val:
                        connStatus === 'connected' && Number.isFinite(telemetry.npu)
                          ? `${telemetry.npu}%`
                          : 'N/A'
                    },
                    {
                      label: 'DDR2 内存',
                      val:
                        connStatus === 'connected' && Number.isFinite(telemetry.ram)
                          ? `${telemetry.ram}%`
                          : '--'
                    }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
                    >
                      <div className="text-[11px] text-slate-500">{item.label}</div>
                      <div className="text-sm font-extrabold text-blue-600 mt-0.5 font-mono">
                        {item.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-blue-600" />
                    板载 /root 目录脚本管理
                  </span>
                  <button
                    onClick={refreshDeviceFiles}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    刷新真机目录
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {deviceFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-mono font-medium text-slate-800 truncate">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400">{file.updated}</span>
                        {file.name.endsWith('.py') && file.name !== 'ws_agent.py' && (
                          <button
                            onClick={() =>
                              executeCodeOnDevice('', true, file.name, {
                                useExistingFile: true
                              })
                            }
                            className="px-2.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px]"
                          >
                            运行
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden h-[340px] shadow-md">
              <div className="px-3.5 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono font-semibold text-white">
                    CocoPi Linux Shell 终端
                  </span>
                </div>
                <button
                  onClick={() => setTerminalLogs([])}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空
                </button>
              </div>

              <div
                ref={terminalContainerRef}
                className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 bg-slate-950"
              >
                {terminalLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed break-all">
                    <span className="text-slate-500 mr-2">[{log.time}]</span>
                    <span
                      className={
                        log.type === 'error'
                          ? 'text-rose-400'
                          : log.type === 'success'
                          ? 'text-emerald-400'
                          : log.type === 'cmd'
                          ? 'text-amber-300 font-semibold'
                          : log.type === 'device'
                          ? 'text-sky-300'
                          : 'text-slate-200'
                      }
                    >
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                {[
                  { label: '查看运行日志', cmd: "cat /tmp/cocopi_run.log 2>/dev/null || echo '暂无日志'" },
                  { label: '列出 /root', cmd: 'ls -la /root' },
                  { label: '查看 Python 进程', cmd: 'ps w | grep python | grep -v grep || true' }
                ].map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleSendCommand(q.cmd)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-sky-300 shrink-0 transition"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCommand();
                }}
                className="flex items-center border-t border-slate-800 bg-slate-900 px-3 py-2 gap-2"
              >
                <span className="text-sky-400 font-mono text-[11px] font-bold shrink-0">
                  root@cocopi:{deviceCwd}#
                </span>
                <input
                  type="text"
                  value={replInput}
                  onChange={(e) => setReplInput(e.target.value)}
                  placeholder="输入 Linux 命令，例如 ls -la /root、ps w、cat /tmp/cocopi_run.log"
                  className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ==================== 3. 官方参考代码沙盒 + AI 编程助手 ==================== */}
        <section
          id="tutorials"
          className="rounded-3xl bg-white border border-blue-100 p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  CocoPi 官方标准编程沙盒 & AI 智能代码生成
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  100% 匹配您提供的 user_latest_code.py 参考源码
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                内置您提供的 <code className="text-blue-600 font-semibold">屏幕显示文字</code> 与 <code className="text-blue-600 font-semibold">摄像头图像预览</code> 原版程序，点击推送后会自动写入 <code className="text-blue-600 font-semibold">/root/user_latest_code.py</code> 并在设备上持续刷新屏幕。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {MAIXPY_PROGRAMS.map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => {
                    setActiveProgram(prog);
                    setEditableCode(prog.python);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                    activeProgram.id === prog.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {prog.title.split('：')[1] || prog.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-sky-50 border border-blue-200/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Wand2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">
                  AI 智能编程助手 (自动按 user_latest_code.py 模板生成代码)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white text-blue-700 border border-blue-200 font-medium">
                  API 密钥仅保存在服务端环境变量
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAiGenerateCode(false);
                }}
                placeholder="输入指令，例如：在屏幕上用中文字体显示“欢迎来到人工智能实验室”和当前时间 / 启动摄像头实时预览..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAiGenerateCode(false)}
                  disabled={isGeneratingAi}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  {isGeneratingAi ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  AI 生成代码
                </button>
                <button
                  onClick={() => handleAiGenerateCode(true)}
                  disabled={isGeneratingAi || isRunningCode}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  生成并真机运行
                </button>
              </div>
            </div>

            {lastRunError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-700">
                    最近一次设备错误
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAiRepairCode(false)}
                      disabled={isGeneratingAi}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold"
                    >
                      AI 修复代码
                    </button>
                    <button
                      onClick={() => handleAiRepairCode(true)}
                      disabled={isGeneratingAi || isRunningCode}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold"
                    >
                      AI 修复并运行
                    </button>
                  </div>
                </div>
                <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed text-rose-800 font-mono">
                  {lastRunError}
                </pre>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col shadow-md">
              <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono font-semibold text-white">
                    Python 代码编辑器
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => executeCodeOnDevice(editableCode, true)}
                    disabled={isRunningCode}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs text-white font-semibold transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isRunningCode ? '正在启动...' : '运行'}
                  </button>
                  <button
                    onClick={handleStopDeviceProgram}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-slate-950 font-semibold transition"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    停止
                  </button>
                  <button
                    onClick={() => setEditableCode(activeProgram.python)}
                    className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition"
                  >
                    重置为官方源码
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(editableCode);
                      setCopiedCode(true);
                      registerTimer(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium transition"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        复制源码
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 min-h-[380px] p-4 font-mono text-xs text-sky-200 bg-slate-950 focus:outline-none leading-relaxed resize-y"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ==================== 扫码配网二维码 ==================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-blue-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                CocoPi 扫码配网二维码生成
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Wi-Fi 名称 (SSID)</label>
                <input
                  type="text"
                  value={qrSsid}
                  onChange={(e) => setQrSsid(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Wi-Fi 密码</label>
                <input
                  type="password"
                  value={qrPassword}
                  onChange={(e) => setQrPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-mono"
                />
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center">
              <div
                className="grid w-36 h-36 bg-white"
                role="img"
                aria-label="CocoPi Wi-Fi 配网二维码"
                style={{
                  gridTemplateColumns: `repeat(${qrCode.size}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${qrCode.size}, minmax(0, 1fr))`
                }}
              >
                {qrCode.modules.flat().map((bit, idx) => (
                  <div key={idx} className={bit ? 'bg-slate-900 rounded-[1px]' : 'bg-white'} />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              二维码内容采用标准 Wi-Fi 配网格式，可直接使用手机或摄像头扫码。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
