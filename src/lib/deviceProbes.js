export const TELEMETRY_MARKER = '__COCOPI_METRICS__';
export const FILE_LIST_MARKER = '__COCOPI_ROOT_FILES__';

const TELEMETRY_PYTHON = String.raw`
import glob
import json
import os
import time

def cpu_snapshot():
    values = [int(part) for part in open('/proc/stat').readline().split()[1:11]]
    idle = values[3] + values[4]
    return idle, sum(values)

idle_a, total_a = cpu_snapshot()
time.sleep(0.2)
idle_b, total_b = cpu_snapshot()
total_delta = max(1, total_b - total_a)
cpu = max(0, min(100, round(100 * (1 - (idle_b - idle_a) / total_delta))))

memory = {}
for line in open('/proc/meminfo'):
    key, value = line.split(':', 1)
    memory[key] = int(value.strip().split()[0])
mem_total = max(1, memory.get('MemTotal', 1))
mem_available = memory.get('MemAvailable', memory.get('MemFree', 0))
ram = max(0, min(100, round(100 * (mem_total - mem_available) / mem_total)))

temperatures = []
for thermal_path in glob.glob('/sys/class/thermal/thermal_zone*/temp'):
    try:
        raw = float(open(thermal_path).read().strip())
        temperatures.append(raw / 1000 if raw > 1000 else raw)
    except Exception:
        pass

print(${JSON.stringify(TELEMETRY_MARKER)} + json.dumps({
    'cpu': cpu,
    'ram': ram,
    'npu': None,
    'temp': round(max(temperatures), 1) if temperatures else None
}))
`;

const FILE_LIST_PYTHON = String.raw`
import json
import os

items = []
for name in sorted(os.listdir('/root'))[:200]:
    path = os.path.join('/root', name)
    try:
        stat = os.stat(path)
        items.append({
            'name': name,
            'size': stat.st_size,
            'mtime': round(stat.st_mtime)
        })
    except Exception:
        pass

print(${JSON.stringify(FILE_LIST_MARKER)} + json.dumps(items))
`;

export function toBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function buildUsbPythonCommand(source) {
  return `python3 -c "import base64;exec(base64.b64decode('${toBase64Utf8(source)}'))"`;
}

export function buildTelemetryProbe() {
  return TELEMETRY_PYTHON;
}

export function buildTelemetryUsbCommand() {
  return buildUsbPythonCommand(TELEMETRY_PYTHON);
}

export function buildFileListProbe() {
  return FILE_LIST_PYTHON;
}

export function buildFileListUsbCommand() {
  return buildUsbPythonCommand(FILE_LIST_PYTHON);
}

function parseMarkedJson(output, marker) {
  const text = String(output || '');
  const markerIndex = text.lastIndexOf(marker);
  if (markerIndex < 0) return null;

  const jsonStart = markerIndex + marker.length;
  const jsonText = text.slice(jsonStart).trim().split(/\r?\n/, 1)[0];
  try {
    return JSON.parse(jsonText);
  } catch (_) {
    return null;
  }
}

export function parseTelemetryOutput(output) {
  const parsed = parseMarkedJson(output, TELEMETRY_MARKER);
  if (!parsed || typeof parsed !== 'object') return null;

  const normalizePercent = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : null;
  };
  const temp = Number(parsed.temp);

  return {
    cpu: normalizePercent(parsed.cpu),
    npu: normalizePercent(parsed.npu),
    ram: normalizePercent(parsed.ram),
    temp: Number.isFinite(temp) ? Number(temp.toFixed(1)) : null
  };
}

export function parseFileListOutput(output) {
  const parsed = parseMarkedJson(output, FILE_LIST_MARKER);
  if (!Array.isArray(parsed)) return null;

  return parsed
    .filter((item) => item && typeof item.name === 'string')
    .map((item) => ({
      name: item.name,
      size: Number(item.size) || 0,
      mtime: Number(item.mtime) || 0
    }));
}

export function formatDeviceFileTime(mtime) {
  if (!mtime) return '时间未知';
  const date = new Date(mtime * 1000);
  if (Number.isNaN(date.getTime())) return '时间未知';
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

