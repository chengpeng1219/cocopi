export const DEPLOY_RESULT_MARKER = '__COCOPI_DEPLOY_RESULT__';
export const STOP_RESULT_MARKER = '__COCOPI_STOP_RESULT__';
export const SHELL_RESULT_MARKER = '__COCOPI_SHELL_RESULT__';
export const SHELL_CWD_MARKER = '__COCOPI_CWD__';
export const SHELL_EXIT_MARKER = '__COCOPI_EXIT__';

function sanitizeFilename(filename) {
  return String(filename || 'user_latest_code.py').replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function buildPythonCommand(source) {
  const encoded = bytesToBase64(new TextEncoder().encode(source));
  return `python3 -c "import base64;exec(base64.b64decode('${encoded}'))"`;
}

export async function buildCompressedWsScript(source) {
  if (typeof CompressionStream !== 'function') {
    throw new Error('当前浏览器不支持 gzip 压缩，请使用最新版 Chrome 或 Edge');
  }
  const compressedStream = new Blob([String(source || '')])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  const compressed = new Uint8Array(await new Response(compressedStream).arrayBuffer());
  const encoded = bytesToBase64(compressed);
  return `import base64,gzip;exec(compile(gzip.decompress(base64.b64decode('${encoded}')).decode('utf-8'),'<cocopi-remote>','exec'),{'__name__':'__main__'})`;
}

export function shellQuote(value) {
  return `'${String(value ?? '').replace(/'/g, `'\"'\"'`)}'`;
}

export function buildNativeShellCommand(command, cwd = '/root') {
  return [
    `cd ${shellQuote(cwd)} && {`,
    String(command || ''),
    '__cocopi_status=$?',
    `printf '\\n${SHELL_CWD_MARKER}%s\\n' "$PWD"`,
    `printf '${SHELL_EXIT_MARKER}%s\\n' "$__cocopi_status"`,
    'exit $__cocopi_status',
    '}'
  ].join('\n');
}

export function parseNativeShellOutput(output) {
  const text = String(output || '');
  const markerIndex = text.lastIndexOf(SHELL_CWD_MARKER);
  if (markerIndex < 0) {
    return {
      output: text,
      cwd: null
    };
  }

  const beforeMarker = text.slice(0, markerIndex).replace(/\r?\n$/, '');
  const afterMarker = text.slice(markerIndex + SHELL_CWD_MARKER.length);
  const lines = afterMarker.split(/\r?\n/);
  const exitLineIndex = lines.findIndex((line) => line.startsWith(SHELL_EXIT_MARKER));
  const exitCode =
    exitLineIndex >= 0
      ? Number(lines[exitLineIndex].slice(SHELL_EXIT_MARKER.length))
      : null;
  return {
    output: beforeMarker,
    cwd: String(lines.shift() || '').trim() || null,
    exitCode: Number.isFinite(exitCode) ? exitCode : null,
    trailing: lines
      .filter((line) => !line.startsWith(SHELL_EXIT_MARKER))
      .join('\n')
      .trim()
  };
}

export function buildShellCommandScript(command, cwd = '/root', timeoutSeconds = 25) {
  const shellCommand = buildNativeShellCommand(command, cwd);
  return String.raw`
import json
import os
import subprocess

RESULT_MARKER = ${JSON.stringify(SHELL_RESULT_MARKER)}
CWD_MARKER = ${JSON.stringify(SHELL_CWD_MARKER)}
SHELL_COMMAND = ${JSON.stringify(shellCommand)}


def emit(payload):
    print(RESULT_MARKER + json.dumps(payload, ensure_ascii=False))


try:
    result = subprocess.run(
        SHELL_COMMAND,
        shell=True,
        executable='/bin/sh',
        capture_output=True,
        text=True,
        timeout=${Number(timeoutSeconds) || 25},
        cwd='/'
    )
    marker_index = result.stdout.rfind(CWD_MARKER)
    cwd = None
    stdout = result.stdout
    if marker_index >= 0:
        stdout = result.stdout[:marker_index].rstrip('\r\n')
        cwd = result.stdout[marker_index + len(CWD_MARKER):].splitlines()[0].strip()

    emit({
        'ok': True,
        'returncode': result.returncode,
        'stdout': stdout[-4000:],
        'stderr': result.stderr[-2000:],
        'cwd': cwd
    })
except subprocess.TimeoutExpired as error:
    emit({
        'ok': False,
        'error': '命令执行超时',
        'stdout': error.stdout or '',
        'stderr': error.stderr or ''
    })
except Exception as error:
    emit({
        'ok': False,
        'error': str(error)
    })
`;
}

export function parseShellCommandResult(output) {
  const text = String(output || '');
  const markerIndex = text.lastIndexOf(SHELL_RESULT_MARKER);
  if (markerIndex < 0) return null;

  const line = text
    .slice(markerIndex + SHELL_RESULT_MARKER.length)
    .trim()
    .split(/\r?\n/, 1)[0];
  try {
    return JSON.parse(line);
  } catch (_) {
    return null;
  }
}

export function buildDeploymentScript(
  pythonCode,
  filename = 'user_latest_code.py',
  { previousPid = null, useExistingFile = false } = {}
) {
  const targetFile = sanitizeFilename(filename);
  const targetPath = `/root/${targetFile}`;

  return String.raw`
import json
import os
import shutil
import signal
import subprocess
import time

RESULT_MARKER = ${JSON.stringify(DEPLOY_RESULT_MARKER)}
SOURCE_CODE = ${JSON.stringify(String(pythonCode || ''))}
TARGET_PATH = ${JSON.stringify(targetPath)}
PREVIOUS_PID = ${Number(previousPid) > 0 ? Number(previousPid) : 'None'}
USE_EXISTING_FILE = ${useExistingFile ? 'True' : 'False'}


def emit(payload):
    print(RESULT_MARKER + json.dumps(payload, ensure_ascii=False))


def python_executable():
    return shutil.which('python3') or shutil.which('python')


def stop_launcher_daemon():
    for pattern in (
        '/maixapp/apps/launcher/launcher[_]daemon',
        '/maixapp/apps/launcher/[l]auncher daemon'
    ):
        subprocess.run(
            ['pkill', '-f', pattern],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False
        )


def maixapp_processes():
    output = subprocess.run(
        ['ps', 'w'],
        capture_output=True,
        text=True,
        check=False
    ).stdout
    current_pid = str(os.getpid())
    processes = []

    for line in output.splitlines():
        parts = line.strip().split(None, 1)
        if len(parts) != 2:
            continue
        pid, command = parts
        if pid == current_pid:
            continue
        if '/maixapp/apps/' not in command:
            continue
        if 'launcher daemon' in command or 'launcher_daemon' in command:
            continue
        if 'ws_agent.py' in command:
            continue
        try:
            processes.append((int(pid), command[:240]))
        except ValueError:
            continue
    return processes


def user_processes():
    output = subprocess.run(
        ['ps', 'w'],
        capture_output=True,
        text=True,
        check=False
    ).stdout
    current_pid = os.getpid()
    processes = []
    markers = (
        '/root/user_latest_code.py',
        '/root/ai_generated',
        '/tmp/cocopi_run_',
        TARGET_PATH
    )

    for line in output.splitlines():
        parts = line.strip().split(None, 1)
        if len(parts) != 2:
            continue
        pid, command = parts
        try:
            parsed_pid = int(pid)
        except ValueError:
            continue
        if parsed_pid == current_pid or 'ws_agent.py' in command:
            continue
        is_previous = (
            PREVIOUS_PID is not None
            and parsed_pid == PREVIOUS_PID
            and 'python' in command.lower()
        )
        if is_previous or any(marker in command for marker in markers):
            processes.append((parsed_pid, command[:240]))
    return processes


def signal_process(pid, signal_number):
    try:
        os.killpg(pid, signal_number)
    except OSError:
        try:
            os.kill(pid, signal_number)
        except OSError:
            pass


def stop_user_programs():
    processes = user_processes()
    for pid, _ in processes:
        signal_process(pid, signal.SIGTERM)

    if processes:
        time.sleep(0.4)

    for pid, _ in user_processes():
        signal_process(pid, signal.SIGKILL)

    if processes:
        time.sleep(0.2)
    return user_processes()


def stop_maixapp_apps():
    processes = maixapp_processes()
    for pid, _ in processes:
        try:
            os.kill(pid, 15)
        except OSError:
            pass

    if processes:
        time.sleep(0.5)

    for pid, _ in maixapp_processes():
        try:
            os.kill(pid, 9)
        except OSError:
            pass

    if processes:
        time.sleep(0.2)
    return maixapp_processes()


def refresh_display(python_cmd):
    refresh_source = """
from maix import display, image

disp = display.Display()
img = image.Image(disp.width(), disp.height(), bg=image.COLOR_BLACK)
disp.show(img)
print('display_refreshed=ok')
"""
    return subprocess.run(
        [python_cmd, '-c', refresh_source],
        capture_output=True,
        text=True,
        timeout=12,
        cwd='/tmp',
        check=False
    )


def read_log_tail(log_path, limit=2000):
    try:
        with open(log_path, 'r', encoding='utf-8', errors='replace') as log_file:
            return log_file.read()[-limit:]
    except Exception:
        return ''


def run():
    python_cmd = python_executable()
    if not python_cmd:
        return {
            'ok': False,
            'stage': 'python',
            'error': '设备上未找到 python3 或 python'
        }

    remaining_user = stop_user_programs()
    if remaining_user:
        return {
            'ok': False,
            'stage': 'stop_previous',
            'error': '无法停止上一次运行的用户程序',
            'processes': [process for _, process in remaining_user]
        }

    stop_launcher_daemon()
    remaining = stop_maixapp_apps()
    if remaining:
        return {
            'ok': False,
            'stage': 'stop_apps',
            'error': '无法停止板端应用，屏幕和摄像头资源仍被占用',
            'processes': [process for _, process in remaining]
        }

    try:
        refreshed = refresh_display(python_cmd)
    except Exception as error:
        return {
            'ok': False,
            'stage': 'display',
            'error': '显示刷新异常: ' + str(error)
        }

    if refreshed.returncode != 0:
        return {
            'ok': False,
            'stage': 'display',
            'error': 'display.Display() 刷新失败',
            'output': (refreshed.stdout + refreshed.stderr)[-4000:]
        }

    if USE_EXISTING_FILE:
        if not os.path.isfile(TARGET_PATH):
            return {
                'ok': False,
                'stage': 'read',
                'error': '设备上不存在指定脚本: ' + TARGET_PATH
            }
    else:
        try:
            os.makedirs(os.path.dirname(TARGET_PATH), exist_ok=True)
            with open(TARGET_PATH, 'w', encoding='utf-8') as target:
                target.write(SOURCE_CODE)
        except Exception as error:
            return {
                'ok': False,
                'stage': 'write',
                'error': '写入设备脚本失败: ' + str(error)
            }

    log_path = '/tmp/cocopi_run.log'
    with open(log_path, 'wb') as log_file:
        env = os.environ.copy()
        env['PYTHONUNBUFFERED'] = '1'
        process = subprocess.Popen(
            [python_cmd, '-u', TARGET_PATH],
            stdout=log_file,
            stderr=subprocess.STDOUT,
            cwd='/root',
            env=env,
            start_new_session=True
        )

    time.sleep(1.5)
    exit_code = process.poll()
    running = exit_code is None
    output = read_log_tail(log_path)

    if not running and exit_code == 0:
        return {
            'ok': True,
            'stage': 'completed',
            'running': False,
            'exit_code': exit_code,
            'target': TARGET_PATH,
            'output': output
        }

    if not running:
        return {
            'ok': False,
            'stage': 'run',
            'running': False,
            'error': '程序启动后立即退出',
            'exit_code': exit_code,
            'output': output,
            'target': TARGET_PATH
        }

    return {
        'ok': True,
        'stage': 'running',
        'running': True,
        'pid': process.pid,
        'target': TARGET_PATH,
        'output': output
    }


try:
    emit(run())
except Exception as error:
    emit({
        'ok': False,
        'stage': 'internal',
        'error': str(error)
    })
`;
}

export function parseDeploymentResult(output) {
  const text = String(output || '');
  const markerIndex = text.lastIndexOf(DEPLOY_RESULT_MARKER);
  if (markerIndex < 0) return null;

  const line = text
    .slice(markerIndex + DEPLOY_RESULT_MARKER.length)
    .trim()
    .split(/\r?\n/, 1)[0];

  try {
    return JSON.parse(line);
  } catch (_) {
    return null;
  }
}

export function buildStopProgramScript(previousPid = null) {
  return String.raw`
import json
import os
import signal
import shutil
import subprocess
import time

RESULT_MARKER = ${JSON.stringify(STOP_RESULT_MARKER)}
PREVIOUS_PID = ${Number(previousPid) > 0 ? Number(previousPid) : 'None'}
LAUNCHER_DAEMON = '/maixapp/apps/launcher/launcher_daemon'
LAUNCHER = '/maixapp/apps/launcher/launcher'


def emit(payload):
    print(RESULT_MARKER + json.dumps(payload, ensure_ascii=False))


def user_processes():
    output = subprocess.run(
        ['ps', 'w'],
        capture_output=True,
        text=True,
        check=False
    ).stdout
    current_pid = os.getpid()
    processes = []
    markers = (
        '/root/user_latest_code.py',
        '/root/ai_generated',
        '/tmp/cocopi_run_'
    )

    for line in output.splitlines():
        parts = line.strip().split(None, 1)
        if len(parts) != 2:
            continue
        pid, command = parts
        try:
            parsed_pid = int(pid)
        except ValueError:
            continue
        if parsed_pid == current_pid or 'ws_agent.py' in command:
            continue
        is_previous = (
            PREVIOUS_PID is not None
            and parsed_pid == PREVIOUS_PID
            and 'python' in command.lower()
        )
        if is_previous or any(marker in command for marker in markers):
            processes.append((parsed_pid, command[:240]))
    return processes


def signal_process(pid, signal_number):
    try:
        os.killpg(pid, signal_number)
    except OSError:
        try:
            os.kill(pid, signal_number)
        except OSError:
            pass


def stop_user_programs():
    stopped = user_processes()
    for pid, _ in stopped:
        signal_process(pid, signal.SIGINT)
    if stopped:
        time.sleep(1.5)

    remaining = user_processes()
    for pid, _ in remaining:
        signal_process(pid, signal.SIGTERM)
    if remaining:
        time.sleep(1.0)

    remaining = user_processes()
    for pid, _ in remaining:
        signal_process(pid, signal.SIGKILL)
    if remaining:
        time.sleep(0.8)
    return stopped, user_processes()


def maixapp_processes():
    output = subprocess.run(
        ['ps', 'w'],
        capture_output=True,
        text=True,
        check=False
    ).stdout
    current_pid = os.getpid()
    processes = []
    for line in output.splitlines():
        if '/maixapp/apps/' not in line:
            continue
        if '/maixapp/apps/launcher/' in line:
            continue
        if 'ws_agent.py' in line:
            continue
        parts = line.strip().split(None, 1)
        if len(parts) != 2:
            continue
        try:
            pid = int(parts[0])
        except ValueError:
            continue
        if pid != current_pid:
            processes.append((pid, parts[1][:240]))
    return processes


def stop_maixapp_apps():
    stopped = maixapp_processes()
    for pid, _ in stopped:
        signal_process(pid, signal.SIGTERM)
    if stopped:
        time.sleep(0.5)
    for pid, _ in maixapp_processes():
        signal_process(pid, signal.SIGKILL)
    if stopped:
        time.sleep(0.3)
    return stopped, maixapp_processes()


def launcher_processes():
    output = subprocess.run(
        ['ps', 'w'],
        capture_output=True,
        text=True,
        check=False
    ).stdout
    processes = []
    for line in output.splitlines():
        if (
            '/maixapp/apps/launcher/' not in line
            and 'launcher daemon' not in line
            and 'launcher_daemon' not in line
        ):
            continue
        parts = line.strip().split(None, 1)
        if len(parts) != 2:
            continue
        try:
            processes.append((int(parts[0]), parts[1][:240]))
        except ValueError:
            pass
    return processes


def launcher_ui_processes():
    return [
        (pid, process)
        for pid, process in launcher_processes()
        if ' daemon' not in process and 'launcher_daemon' not in process
    ]


def stop_launcher_processes():
    processes = launcher_processes()
    for pid, _ in processes:
        signal_process(pid, signal.SIGKILL)
    if processes:
        time.sleep(1.5)
    return processes


def read_launcher_log():
    try:
        with open('/tmp/launcher-daemon.log', 'r', encoding='utf-8', errors='replace') as log:
            return log.read()[-3000:]
    except Exception:
        return ''


def read_launcher_ui_log():
    try:
        with open('/tmp/launcher-ui.log', 'r', encoding='utf-8', errors='replace') as log:
            return log.read()[-3000:]
    except Exception:
        return ''


def clear_display_before_launcher():
    python_cmd = shutil.which('python3') or shutil.which('python')
    if not python_cmd:
        return {'ok': False, 'error': '设备上未找到 Python'}

    source = """
from maix import display, image

disp = display.Display()
img = image.Image(disp.width(), disp.height(), bg=image.COLOR_BLACK)
disp.show(img)
print('display_cleared=ok')
"""
    attempts = []
    for attempt in range(3):
        try:
            result = subprocess.run(
                [python_cmd, '-c', source],
                capture_output=True,
                text=True,
                timeout=10,
                cwd='/tmp',
                check=False
            )
            attempts.append({
                'attempt': attempt + 1,
                'returncode': result.returncode,
                'output': (result.stdout + result.stderr)[-2000:]
            })
            if result.returncode == 0:
                return {
                    'ok': True,
                    'returncode': result.returncode,
                    'output': (result.stdout + result.stderr)[-2000:],
                    'attempts': attempts
                }
        except Exception as error:
            attempts.append({
                'attempt': attempt + 1,
                'error': str(error)
            })

        if attempt < 2:
            time.sleep(2.0)

    last = attempts[-1] if attempts else {}
    return {
        'ok': False,
        'error': last.get('error') or 'display.Display() 连续三次初始化失败',
        'output': last.get('output', ''),
        'attempts': attempts
    }


def start_launcher():
    previous = stop_launcher_processes()
    try:
        open('/tmp/launcher-daemon.log', 'wb').close()
        open('/tmp/launcher-ui.log', 'wb').close()
    except Exception:
        pass
    candidates = []
    if os.access(LAUNCHER, os.X_OK):
        candidates.append([LAUNCHER, 'daemon'])
    if os.access(LAUNCHER_DAEMON, os.X_OK):
        candidates.append([LAUNCHER_DAEMON])
    if not candidates:
        return {'started': False, 'error': 'launcher daemon 不存在'}

    attempts = []
    for command in candidates:
        try:
            if attempts:
                stop_launcher_processes()
            shell_command = (
                'nohup '
                + ' '.join(command)
                + ' >> /tmp/launcher-daemon.log 2>&1 &'
            )
            subprocess.run(
                ['/bin/sh', '-c', shell_command],
                cwd='/maixapp/apps/launcher',
                check=False
            )
            time.sleep(3.0)
            processes = launcher_processes()
            attempts.append({
                'command': ' '.join(command),
                'processes': [item for _, item in processes]
            })
            if processes:
                ui_command = (
                    'nohup '
                    + LAUNCHER
                    + ' >> /tmp/launcher-ui.log 2>&1 &'
                )
                subprocess.run(
                    ['/bin/sh', '-c', ui_command],
                    cwd='/maixapp/apps/launcher',
                    check=False
                )
                time.sleep(2.0)
                ui_processes = launcher_ui_processes()
                if ui_processes:
                    return {
                        'started': True,
                        'previous_pids': [pid for pid, _ in previous],
                        'command': ' '.join(command) + ' + ' + LAUNCHER,
                        'processes': [item for _, item in processes + ui_processes]
                    }
                attempts.append({
                    'command': LAUNCHER,
                    'error': 'launcher daemon 已运行，但 launcher UI 未保持运行',
                    'log': read_launcher_ui_log()
                })
        except Exception as error:
            attempts.append({
                'command': ' '.join(command),
                'error': str(error)
            })

    return {
        'started': False,
        'error': 'launcher daemon 启动后未保持运行',
        'attempts': attempts,
        'log': read_launcher_log()
    }


try:
    stopped, remaining = stop_user_programs()
    if remaining:
        launcher = {'started': False, 'error': '用户程序仍在运行，未恢复 launcher'}
    else:
        stopped_apps, remaining_apps = stop_maixapp_apps()
        if remaining_apps:
            launcher = {
                'started': False,
                'error': '板端应用仍在运行，未恢复 launcher',
                'processes': [process for _, process in remaining_apps]
            }
        else:
            time.sleep(3.0)
            previous_launcher = stop_launcher_processes()
            time.sleep(2.0)
            screen_clear = clear_display_before_launcher()
            launcher = start_launcher()
            launcher['screen_clear'] = screen_clear
            launcher['previous_launcher_pids'] = [
                pid for pid, _ in previous_launcher
            ]
    emit({
        'ok': (
            len(remaining) == 0
            and launcher.get('started', False)
            and launcher.get('screen_clear', {}).get('ok', True)
        ),
        'program_stopped': len(remaining) == 0,
        'stopped': [pid for pid, _ in stopped],
        'stopped_apps': [pid for pid, _ in stopped_apps] if not remaining else [],
        'remaining': [process for _, process in remaining],
        'launcher': launcher
    })
except Exception as error:
    emit({
        'ok': False,
        'error': str(error),
        'stopped': [],
        'remaining': []
    })
`;
}

export function parseStopResult(output) {
  const text = String(output || '');
  const markerIndex = text.lastIndexOf(STOP_RESULT_MARKER);
  if (markerIndex < 0) return null;

  const line = text
    .slice(markerIndex + STOP_RESULT_MARKER.length)
    .trim()
    .split(/\r?\n/, 1)[0];
  try {
    return JSON.parse(line);
  } catch (_) {
    return null;
  }
}

export function buildWifiProgramScript(pythonCode, filename = 'user_latest_code.py') {
  const targetFile = sanitizeFilename(filename);
  const targetPath = `/root/${targetFile}`;

  return String.raw`
import json
import os
import shutil
import subprocess
import time

RESULT_MARKER = ${JSON.stringify(DEPLOY_RESULT_MARKER)}
SOURCE_CODE = ${JSON.stringify(String(pythonCode || ''))}
TARGET_PATH = ${JSON.stringify(targetPath)}


def emit(payload):
    print(RESULT_MARKER + json.dumps(payload, ensure_ascii=False))


try:
    with open(TARGET_PATH, 'w', encoding='utf-8') as target:
        target.write(SOURCE_CODE)

    python_cmd = shutil.which('python3') or shutil.which('python')
    if not python_cmd:
        raise RuntimeError('设备上未找到 Python')
    compile_result = subprocess.run(
        [python_cmd, '-m', 'py_compile', TARGET_PATH],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False
    )
    if compile_result.returncode != 0:
        raise RuntimeError(
            'Python 语法检查未通过:\n' + (compile_result.stdout or '')[-2000:]
        )

    os.system("pkill -f '/root/[e]vent.py' 2>/dev/null || true")
    os.system("pkill -f '/root/[c]ocopi_run.py' 2>/dev/null || true")
    os.system("pkill -f '/root/[u]ser_latest_code.py' 2>/dev/null || true")
    os.system('systemctl stop llm-tokenizer.service sensevoice.service')
    os.system('systemctl stop launcher.service')

    command = (
        "nohup sudo python -u " + TARGET_PATH +
        " >/tmp/cocopi_run.log 2>&1 &"
    )
    os.system(command)
    time.sleep(2.0)

    running = subprocess.run(
        ['pgrep', '-f', TARGET_PATH],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    ).returncode == 0
    try:
        log = open('/tmp/cocopi_run.log', 'r', encoding='utf-8', errors='replace').read()[-2000:]
    except Exception:
        log = ''

    emit({
        'ok': running,
        'running': running,
        'target': TARGET_PATH,
        'output': log,
        'error': '' if running else '程序启动后未检测到运行进程'
    })
except Exception as error:
    emit({
        'ok': False,
        'stage': 'run',
        'error': str(error)
    })
`;
}

export function buildWifiStopScript() {
  return String.raw`
import json
import os
import subprocess
import time

RESULT_MARKER = ${JSON.stringify(STOP_RESULT_MARKER)}


def emit(payload):
    print(RESULT_MARKER + json.dumps(payload, ensure_ascii=False))


try:
    os.system("pkill -f '/root/[e]vent.py' 2>/dev/null || true")
    os.system("pkill -f '/root/[c]ocopi_run.py' 2>/dev/null || true")
    os.system("pkill -f '/root/[u]ser_latest_code.py' 2>/dev/null || true")
    os.system('systemctl stop llm-tokenizer.service sensevoice.service')
    raw_status = os.system('systemctl start launcher.service')
    status = os.waitstatus_to_exitcode(raw_status)
    time.sleep(2.0)

    emit({
        'ok': status == 0,
        'program_stopped': True,
        'stopped': [],
        'remaining': [],
        'launcher': {
            'started': status == 0,
            'command': 'systemctl start launcher.service',
            'error': '' if status == 0 else 'systemctl 返回 ' + str(status)
        }
    })
except Exception as error:
    emit({
        'ok': False,
        'program_stopped': False,
        'error': str(error),
        'stopped': [],
        'remaining': []
    })
`;
}
