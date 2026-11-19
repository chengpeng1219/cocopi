export const DEPLOY_RESULT_MARKER = '__COCOPI_DEPLOY_RESULT__';
export const UPLOAD_RESULT_MARKER = '__COCOPI_UPLOAD_RESULT__';
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

export function buildPortablePythonCommand(source) {
  const encoded = bytesToBase64(new TextEncoder().encode(source));
  return (
    `PY=$(command -v python3 || command -v python); ` +
    `[ -n "$PY" ] || { echo '设备上未找到 python3 或 python' >&2; exit 127; }; ` +
    `"$PY" -c "import base64;exec(base64.b64decode('${encoded}'))"`
  );
}

export function buildUploadProgramScript(pythonCode, filename = 'user_latest_code.py') {
  const targetPath = `/root/${sanitizeFilename(filename)}`;
  return String.raw`
import json
import os
import shutil
import subprocess

RESULT_MARKER = ${JSON.stringify(UPLOAD_RESULT_MARKER)}
SOURCE_CODE = ${JSON.stringify(String(pythonCode || ''))}
TARGET_PATH = ${JSON.stringify(targetPath)}


def emit(payload):
    print(RESULT_MARKER + json.dumps(payload, ensure_ascii=False))


try:
    with open(TARGET_PATH, 'w', encoding='utf-8') as target:
        target.write(SOURCE_CODE)
    python_cmd = shutil.which('python3') or shutil.which('python')
    if not python_cmd:
        raise RuntimeError('设备上未找到 python3 或 python')
    compile_result = subprocess.run(
        [python_cmd, '-m', 'py_compile', TARGET_PATH],
        capture_output=True,
        text=True,
        check=False
    )
    if compile_result.returncode != 0:
        raise RuntimeError(
            (compile_result.stdout + compile_result.stderr)[-3000:]
            or 'Python 语法检查失败'
        )
    emit({
        'ok': True,
        'target': TARGET_PATH,
        'python': python_cmd
    })
except Exception as error:
    emit({
        'ok': False,
        'target': TARGET_PATH,
        'error': str(error)
    })
`;
}

export function parseUploadProgramResult(output) {
  const text = String(output || '');
  const markerIndex = text.lastIndexOf(UPLOAD_RESULT_MARKER);
  if (markerIndex < 0) return null;
  const line = text
    .slice(markerIndex + UPLOAD_RESULT_MARKER.length)
    .trim()
    .split(/\r?\n/, 1)[0];
  try {
    return JSON.parse(line);
  } catch (_) {
    return null;
  }
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
    subprocess.run(
        ['systemctl', 'stop', 'launcher.service'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    )
    subprocess.run(
        ['systemctl', 'stop', 'llm-tokenizer.service', 'sensevoice.service'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    )
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
        time.sleep(1.5)

    for pid, _ in user_processes():
        signal_process(pid, signal.SIGKILL)

    if processes:
        time.sleep(1.0)
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


def display_holder_processes():
    current_pid = os.getpid()
    holders = []
    for proc_name in os.listdir('/proc'):
        if not proc_name.isdigit():
            continue
        pid = int(proc_name)
        if pid == current_pid or pid <= 1:
            continue
        fd_dir = '/proc/' + proc_name + '/fd'
        try:
            command = open('/proc/' + proc_name + '/cmdline', 'rb').read().replace(
                b'\x00',
                b' '
            ).decode('utf-8', errors='replace').strip()[:240]
            if 'ws_agent.py' in command:
                continue
            holds_display = False
            for fd_name in os.listdir(fd_dir):
                try:
                    target = os.readlink(fd_dir + '/' + fd_name)
                    if (
                        target.startswith('/dev/fb')
                        or target.startswith('/dev/vo')
                        or target.startswith('/dev/vb')
                        or target.startswith('/dev/video')
                    ):
                        holds_display = True
                        break
                except OSError:
                    continue
            if holds_display:
                holders.append((pid, command or 'unknown'))
        except OSError:
            continue
    return holders


def release_display_resources():
    holders = display_holder_processes()
    for pid, _ in holders:
        signal_process(pid, signal.SIGTERM)
    if holders:
        time.sleep(1.0)

    for pid, _ in display_holder_processes():
        signal_process(pid, signal.SIGKILL)

    for _ in range(10):
        remaining = display_holder_processes()
        if not remaining:
            return []
        time.sleep(0.5)
    return display_holder_processes()


def read_log_tail(log_path, limit=2000):
    try:
        with open(log_path, 'r', encoding='utf-8', errors='replace') as log_file:
            return log_file.read()[-limit:]
    except Exception:
        return ''


def restore_launcher_service():
    try:
        result = subprocess.run(
            ['systemctl', 'start', 'launcher.service'],
            capture_output=True,
            text=True,
            timeout=12,
            check=False
        )
        time.sleep(2.0)
        output = (result.stdout + result.stderr)[-2000:]
        return {
            'started': result.returncode == 0,
            'command': 'systemctl start launcher.service',
            'output': output,
            'error': '' if result.returncode == 0 else (
                'systemctl 返回 ' + str(result.returncode)
            )
        }
    except Exception as error:
        return {
            'started': False,
            'command': 'systemctl start launcher.service',
            'error': str(error)
        }


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

    remaining_display = release_display_resources()
    if remaining_display:
        return {
            'ok': False,
            'stage': 'display_release',
            'error': '旧程序仍占用显示或摄像头资源',
            'processes': [process for _, process in remaining_display]
        }

    if PREVIOUS_PID is not None:
        time.sleep(2.0)
    else:
        time.sleep(0.5)

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
            stdin=subprocess.DEVNULL,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            cwd='/root',
            env=env,
            start_new_session=True,
            close_fds=True
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
    result = run()
    if not result.get('running'):
        result['launcher'] = restore_launcher_service()
    emit(result)
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

export function buildSafeStopProgramScript(previousPid = null) {
  return String.raw`
import json
import os
import signal
import subprocess
import time

RESULT_MARKER = ${JSON.stringify(STOP_RESULT_MARKER)}
PREVIOUS_PID = ${Number(previousPid) > 0 ? Number(previousPid) : 'None'}


def emit(payload):
    print(RESULT_MARKER + json.dumps(payload, ensure_ascii=False))


def process_command(pid):
    try:
        data = open(
            '/proc/' + str(pid) + '/cmdline',
            'rb'
        ).read().replace(b'\x00', b' ')
        return data.decode('utf-8', errors='replace').strip()[:1000]
    except OSError:
        return ''


def user_processes():
    current_pid = os.getpid()
    processes = []
    markers = (
        '/root/user_latest_code.py',
        '/root/event.py',
        '/root/cocopi_run.py',
        '/root/ai_generated',
        '/tmp/cocopi_run_'
    )

    for proc_name in os.listdir('/proc'):
        if not proc_name.isdigit():
            continue
        pid = int(proc_name)
        if pid == current_pid:
            continue
        command = process_command(pid)
        if not command or 'ws_agent.py' in command:
            continue
        is_previous = (
            PREVIOUS_PID is not None
            and pid == PREVIOUS_PID
            and 'python' in command.lower()
        )
        if is_previous or any(marker in command for marker in markers):
            processes.append((pid, command[:240]))
    return processes


def signal_process(pid, signal_number):
    try:
        os.killpg(pid, signal_number)
        return
    except OSError:
        pass
    try:
        os.kill(pid, signal_number)
    except OSError:
        pass


def wait_until_stopped(timeout_seconds):
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        if not user_processes():
            return []
        time.sleep(0.2)
    return user_processes()


def stop_user_programs():
    original = user_processes()
    stopped_pids = []

    for pid, _ in original:
        signal_process(pid, signal.SIGINT)
    remaining = wait_until_stopped(2.5)
    stopped_pids.extend(
        pid for pid, _ in original
        if all(pid != remaining_pid for remaining_pid, _ in remaining)
    )

    if remaining:
        for pid, _ in remaining:
            signal_process(pid, signal.SIGTERM)
        remaining = wait_until_stopped(2.5)
        stopped_pids.extend(
            pid for pid, _ in original
            if pid not in stopped_pids
            and all(pid != remaining_pid for remaining_pid, _ in remaining)
        )

    if remaining:
        for pid, _ in remaining:
            signal_process(pid, signal.SIGKILL)
        remaining = wait_until_stopped(2.0)
        stopped_pids.extend(
            pid for pid, _ in original
            if pid not in stopped_pids
            and all(pid != remaining_pid for remaining_pid, _ in remaining)
        )

    return [
        f'{pid}: {command}'
        for pid, command in original
        if pid in stopped_pids
    ], remaining


def start_launcher():
    if user_processes():
        return {
            'started': False,
            'command': 'systemctl start launcher.service',
            'error': '用户程序仍在运行，未启动 launcher'
        }

    subprocess.run(
        ['systemctl', 'stop', 'llm-tokenizer.service', 'sensevoice.service'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    )
    subprocess.run(
        ['systemctl', 'reset-failed', 'launcher.service'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    )
    result = subprocess.run(
        ['systemctl', 'start', 'launcher.service'],
        capture_output=True,
        text=True,
        timeout=15,
        check=False
    )
    time.sleep(2.5)
    active = subprocess.run(
        ['systemctl', 'is-active', '--quiet', 'launcher.service'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    )
    output = (result.stdout + result.stderr)[-2000:]
    started = result.returncode == 0 and active.returncode == 0
    return {
        'started': started,
        'command': 'systemctl start launcher.service',
        'output': output,
        'error': '' if started else (
            'launcher.service 未正常启动'
            + ('，返回码 ' + str(result.returncode) if result.returncode else '')
            + ('，当前状态异常' if active.returncode else '')
        )
    }


try:
    stopped, remaining = stop_user_programs()
    if remaining:
        emit({
            'ok': False,
            'program_stopped': False,
            'stopped': stopped,
            'remaining': [
                f'{pid}: {command}' for pid, command in remaining
            ],
            'launcher': {
                'started': False,
                'error': '用户程序未完全退出，已取消启动 launcher'
            }
        })
    else:
        launcher = start_launcher()
        emit({
            'ok': launcher.get('started', False),
            'program_stopped': True,
            'stopped': [
                item.split(':', 1)[0] for item in stopped
            ],
            'remaining': [],
            'launcher': launcher
        })
except Exception as error:
    emit({
        'ok': False,
        'program_stopped': False,
        'stopped': [],
        'remaining': [],
        'error': str(error)
    })
`;
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


def display_holder_processes():
    current_pid = os.getpid()
    processes = []
    for proc_name in os.listdir('/proc'):
        if not proc_name.isdigit():
            continue
        pid = int(proc_name)
        if pid == current_pid or pid <= 1:
            continue
        fd_dir = '/proc/' + proc_name + '/fd'
        try:
            command = open('/proc/' + proc_name + '/cmdline', 'rb').read().replace(
                b'\x00',
                b' '
            ).decode('utf-8', errors='replace').strip()[:240]
            if 'ws_agent.py' in command:
                continue
            holds_display = False
            for fd_name in os.listdir(fd_dir):
                try:
                    target = os.readlink(fd_dir + '/' + fd_name)
                    if (
                        target.startswith('/dev/fb')
                        or target.startswith('/dev/vo')
                        or target.startswith('/dev/video')
                    ):
                        holds_display = True
                        break
                except OSError:
                    continue
            if holds_display:
                processes.append((pid, command or 'unknown'))
        except OSError:
            continue
    return processes


def force_release_display_resources():
    stopped = display_holder_processes()
    for pid, _ in stopped:
        signal_process(pid, signal.SIGTERM)
    if stopped:
        time.sleep(1.0)
    remaining = display_holder_processes()
    for pid, _ in remaining:
        signal_process(pid, signal.SIGKILL)
    if remaining:
        time.sleep(0.5)
    return stopped, display_holder_processes()


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
    subprocess.run(
        ['systemctl', 'stop', 'launcher.service'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    )
    processes = launcher_processes()
    for pid, _ in processes:
        signal_process(pid, signal.SIGTERM)
    if processes:
        time.sleep(1.0)
    for pid, _ in launcher_processes():
        signal_process(pid, signal.SIGKILL)
    if processes:
        time.sleep(0.5)
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
    return {
        'ok': True,
        'skipped': True,
        'output': 'display initialization delegated to launcher.service'
    }


def start_launcher():
    try:
        try:
            open('/tmp/launcher-daemon.log', 'wb').close()
            open('/tmp/launcher-ui.log', 'wb').close()
        except Exception:
            pass
        subprocess.run(
            ['systemctl', 'reset-failed', 'launcher.service'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False
        )
        result = subprocess.run(
            ['systemctl', 'restart', 'launcher.service'],
            capture_output=True,
            text=True,
            timeout=15,
            check=False
        )
        ui_pid = None
        ui_start_error = ''
        time.sleep(1.0)
        if not launcher_ui_processes():
            try:
                with open('/tmp/launcher-ui.log', 'ab') as ui_log:
                    ui_process = subprocess.Popen(
                        [LAUNCHER],
                        stdin=subprocess.DEVNULL,
                        stdout=ui_log,
                        stderr=subprocess.STDOUT,
                        cwd='/maixapp/apps/launcher',
                        start_new_session=True,
                        close_fds=True
                    )
                    ui_pid = ui_process.pid
            except Exception as error:
                ui_start_error = str(error)
        active_code = 1
        processes = []
        time.sleep(3.0)
        active = subprocess.run(
            ['systemctl', 'is-active', '--quiet', 'launcher.service'],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False
        )
        active_code = active.returncode
        processes = launcher_processes()
        display_holders = display_holder_processes()
        launcher_holding_display = any(
            'launcher' in command
            for _, command in display_holders
        )
        try:
            journal = subprocess.run(
                [
                    'journalctl',
                    '-u',
                    'launcher.service',
                    '-n',
                    '40',
                    '--no-pager',
                    '--output=cat'
                ],
                capture_output=True,
                text=True,
                timeout=5,
                check=False
            ).stdout[-4000:]
        except Exception:
            journal = ''
        launcher_log = (
            read_launcher_log()
            + '\n'
            + read_launcher_ui_log()
            + '\n'
            + journal
        )
        fatal_tokens = (
            'traceback',
            'vo init failed',
            'unknown error',
            'failed with',
            'sample_comm_vo_startvo failed'
        )
        log_has_error = any(
            token in launcher_log.lower()
            for token in fatal_tokens
        )
        return {
            'started': (
                result.returncode == 0
                and active_code == 0
                and (bool(processes) or launcher_holding_display)
                and not log_has_error
                and not ui_start_error
            ),
            'command': 'systemctl restart launcher.service + launcher UI',
            'processes': [process for _, process in processes],
            'ui_pid': ui_pid,
            'launcher_holding_display': launcher_holding_display,
            'output': (result.stdout + result.stderr)[-2000:],
            'stable_seconds': 3,
            'error': '' if (
                result.returncode == 0
                and active_code == 0
                and (bool(processes) or launcher_holding_display)
                and not log_has_error
                and not ui_start_error
            ) else (
                'systemctl 返回 ' + str(result.returncode)
                + ', is-active=' + str(active_code)
                + ', launcher_processes=' + str(len(processes))
                + ', launcher_display=' + str(launcher_holding_display)
                + (', launcher 日志包含错误' if log_has_error else '')
                + (', UI 启动失败: ' + ui_start_error if ui_start_error else '')
            ),
            'log': launcher_log[-6000:]
        }
    except Exception as error:
        return {
            'started': False,
            'command': 'systemctl restart launcher.service',
            'error': str(error)
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
            time.sleep(1.0)
            previous_launcher = stop_launcher_processes()
            time.sleep(0.5)
            display_stopped, display_remaining = force_release_display_resources()
            screen_clear = clear_display_before_launcher()
            launcher = start_launcher()
            launcher['screen_clear'] = screen_clear
            launcher['display_stopped'] = [
                process for _, process in display_stopped
            ]
            launcher['display_remaining'] = [
                process for _, process in display_remaining
            ]
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

export const WIFI_UPLOAD_INIT_MARKER = '__COCOPI_UPLOAD_INIT_OK__';
export const WIFI_COMPILE_MARKER = '__COCOPI_WIFI_COMPILE_RESULT__';
export const WIFI_PREPARE_MARKER = '__COCOPI_WIFI_PREPARE_OK__';

export function wifiUploadChunkMarker(index) {
  return `__COCOPI_UPLOAD_CHUNK_OK__:${Number(index)}`;
}

function wifiTargetPath(filename) {
  return `/root/${sanitizeFilename(filename)}`;
}

export function splitWifiUploadChunks(source, chunkSize = 512) {
  const encoded = bytesToBase64(new TextEncoder().encode(String(source || '')));
  const numericChunkSize = Number(chunkSize);
  const normalizedChunkSize =
    Number.isFinite(numericChunkSize) && numericChunkSize >= 4 ? numericChunkSize : 512;
  const safeChunkSize = Math.max(
    4,
    Math.floor(normalizedChunkSize) - (Math.floor(normalizedChunkSize) % 4)
  );
  const chunks = [];
  for (let index = 0; index < encoded.length; index += safeChunkSize) {
    chunks.push(encoded.slice(index, index + safeChunkSize));
  }
  return chunks.length ? chunks : [''];
}

export function buildWifiUploadInitScript(filename = 'user_latest_code.py') {
  const targetPath = wifiTargetPath(filename);
  return String.raw`
import json

TARGET_PATH = ${JSON.stringify(targetPath)}

try:
    with open(TARGET_PATH, 'wb'):
        pass
    print(${JSON.stringify(WIFI_UPLOAD_INIT_MARKER)})
except Exception as error:
    print('__COCOPI_UPLOAD_ERROR__:' + json.dumps(str(error), ensure_ascii=False))
`;
}

export function buildWifiUploadChunkScript(
  base64Chunk,
  index,
  filename = 'user_latest_code.py'
) {
  const targetPath = wifiTargetPath(filename);
  return String.raw`
import base64

TARGET_PATH = ${JSON.stringify(targetPath)}
CHUNK = ${JSON.stringify(String(base64Chunk || ''))}

data = base64.b64decode(CHUNK)
with open(TARGET_PATH, 'ab') as target:
    target.write(data)
print(${JSON.stringify(wifiUploadChunkMarker(index))})
`;
}

export function buildWifiUploadStartScript(filename = 'user_latest_code.py') {
  const targetPath = wifiTargetPath(filename);
  return String.raw`
import json
import os
import shutil
import subprocess
import time

RESULT_MARKER = ${JSON.stringify(DEPLOY_RESULT_MARKER)}
TARGET_PATH = ${JSON.stringify(targetPath)}


def emit(payload):
    print(RESULT_MARKER + json.dumps(payload, ensure_ascii=False))


def unique(values):
    result = []
    for value in values:
        if value and value not in result:
            result.append(value)
    return result


def find_library_dirs():
    found = []
    roots = (
        '/usr/local/lib/python3.13/site-packages/maix',
        '/maixapp/lib',
        '/maixapp/share/lib',
        '/opt/lib'
    )
    for root in roots:
        if not os.path.isdir(root):
            continue
        for current, _, files in os.walk(root):
            if any(name.startswith('libonnxruntime.so') for name in files):
                if current not in found:
                    found.append(current)
            if len(found) >= 4:
                return found
    return found


def build_runtime_env():
    env = os.environ.copy()
    library_path = env.get('LD_LIBRARY_PATH', '')
    env['LD_LIBRARY_PATH'] = ':'.join(unique([
        library_path,
        *find_library_dirs(),
        '/usr/local/lib',
        '/usr/local/lib/python3.13/site-packages',
        '/usr/local/lib/python3.13/site-packages/maix',
        '/usr/local/lib/python3.13/site-packages/maix/_maix',
        '/usr/lib',
        '/usr/lib64',
        '/usr/lib/aarch64-linux-gnu',
        '/lib/aarch64-linux-gnu',
        '/lib',
        '/lib64',
        '/usr/local/lib64',
        '/maixapp/lib',
        '/maixapp/share/lib',
        '/opt/lib'
    ]))
    return env


def python_candidates():
    commands = []
    for path in (
        '/usr/bin/python3',
        '/usr/bin/python',
        '/usr/local/bin/python3',
        '/usr/local/bin/python'
    ):
        if os.path.exists(path):
            commands.append([path])
            if os.path.exists('/usr/bin/sudo'):
                commands.append(['/usr/bin/sudo', '-n', path])
    for name in ('python3', 'python'):
        path = shutil.which(name)
        if path:
            commands.append([path])

    result = []
    for command in commands:
        if command not in result:
            result.append(command)
    return result


def select_python(env):
    attempts = []
    for command in python_candidates():
        try:
            check = subprocess.run(
                command + ['-c', 'from maix import display'],
                capture_output=True,
                text=True,
                timeout=4,
                env=env,
                check=False
            )
            attempts.append({
                'command': ' '.join(command),
                'returncode': check.returncode,
                'output': (check.stdout + check.stderr)[-1000:]
            })
            if check.returncode == 0:
                return command, attempts
        except Exception as error:
            attempts.append({
                'command': ' '.join(command),
                'error': str(error)
            })
    raise RuntimeError(
        '没有找到可导入 maix 的 Python: '
        + json.dumps(attempts, ensure_ascii=False)
    )


try:
    runtime_env = build_runtime_env()
    python_cmd, python_attempts = select_python(runtime_env)

    compile_result = subprocess.run(
        python_cmd + ['-m', 'py_compile', TARGET_PATH],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=runtime_env,
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

    log_path = '/tmp/cocopi_run.log'
    with open(log_path, 'wb') as log_file:
        process = subprocess.Popen(
            python_cmd + ['-u', TARGET_PATH],
            stdin=subprocess.DEVNULL,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            cwd='/root',
            env=runtime_env,
            start_new_session=True,
            close_fds=True
        )

    time.sleep(1.5)
    exit_code = process.poll()
    running = exit_code is None
    try:
        output = open(log_path, 'r', encoding='utf-8', errors='replace').read()[-2000:]
    except Exception:
        output = ''

    emit({
        'ok': running,
        'running': running,
        'pid': process.pid if running else None,
        'python': ' '.join(python_cmd),
        'python_attempts': python_attempts,
        'target': TARGET_PATH,
        'output': output,
        'error': '' if running else '程序启动后立即退出'
    })
except Exception as error:
    emit({
        'ok': False,
        'stage': 'run',
        'error': str(error)
    })
`;
}

export function buildWifiCompileUploadedScript(filename = 'user_latest_code.py') {
  const targetPath = wifiTargetPath(filename);
  return String.raw`
import json
import os
import subprocess

TARGET_PATH = ${JSON.stringify(targetPath)}
PYTHON = next((path for path in (
    '/usr/bin/python3',
    '/usr/bin/python',
    '/usr/local/bin/python3',
    '/usr/local/bin/python'
) if os.path.exists(path)), 'python3')

result = subprocess.run(
    [PYTHON, '-m', 'py_compile', TARGET_PATH],
    capture_output=True,
    text=True,
    check=False
)
if result.returncode != 0:
    print(${JSON.stringify(WIFI_COMPILE_MARKER)} + json.dumps({
        'ok': False,
        'python': PYTHON,
        'error': (result.stdout + result.stderr)[-2000:]
    }, ensure_ascii=False))
else:
    print(${JSON.stringify(WIFI_COMPILE_MARKER)} + json.dumps({
        'ok': True,
        'python': PYTHON
    }, ensure_ascii=False))
`;
}

export function buildWifiLaunchUploadedScript(filename = 'user_latest_code.py') {
  const targetPath = wifiTargetPath(filename);
  return String.raw`
import json
import os
import subprocess
import time

M = ${JSON.stringify(DEPLOY_RESULT_MARKER)}
T = ${JSON.stringify(targetPath)}


def emit(p):
    print(M + json.dumps(p, ensure_ascii=False))


try:
    os.system("nohup sudo python -u " + T + " >/tmp/cocopi_run.log 2>&1 &")
    time.sleep(2.0)
    running = subprocess.run(
        ['pgrep', '-f', T],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    ).returncode == 0
    try:
        output = open('/tmp/cocopi_run.log', encoding='utf-8', errors='replace').read()[-2000:]
    except Exception:
        output = ''
    emit({
        'ok': running,
        'running': running,
        'target': T,
        'output': output,
        'error': '' if running else '程序启动后立即退出'
    })
except Exception as error:
    emit({'ok': False, 'stage': 'run', 'error': str(error)})
`;
}

export function buildWifiPrepareLaunchScript() {
  return String.raw`
import os

os.system("pkill -f '/root/[e]vent.py' 2>/dev/null || true")
os.system("pkill -f '/root/[c]ocopi_run.py' 2>/dev/null || true")
os.system("pkill -f '/root/[u]ser_latest_code.py' 2>/dev/null || true")
os.system('systemctl stop llm-tokenizer.service sensevoice.service')
os.system('systemctl stop launcher.service')
print(${JSON.stringify(WIFI_PREPARE_MARKER)})
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

export function parseWifiCompileResult(output) {
  const text = String(output || '');
  const markerIndex = text.lastIndexOf(WIFI_COMPILE_MARKER);
  if (markerIndex < 0) return null;
  const line = text
    .slice(markerIndex + WIFI_COMPILE_MARKER.length)
    .trim()
    .split(/\r?\n/, 1)[0];
  try {
    return JSON.parse(line);
  } catch (_) {
    return null;
  }
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
