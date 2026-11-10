export const APP_READY_MARKER = '[APP_READY]';

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
const ERROR_LINE_PATTERN =
  /Traceback|SyntaxError|ImportError|ModuleNotFoundError|NameError|AttributeError|TypeError|ValueError|RuntimeError|OSError|PermissionError|FileNotFoundError|Exception|Error Code|\/bin\/sh:|No such file|Read-only file system/i;
const NOISE_LINE_PATTERN =
  /^-- \[I\]|^\[SAMPLE-|^\[COMM_|^\[COMMON_|maix multi-media driver|^AX_|^i2c_init:|auto set pinmap|listening on uart|^init fb0 done$|used count:/i;

function hasImport(code, moduleName) {
  const escaped = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `^\\s*(?:from\\s+maix\\s+import[^\\n]*\\b${escaped}\\b|import\\s+maix\\.${escaped})`,
    'm'
  ).test(code);
}

export function validateMaixPyCode(source) {
  const code = String(source || '');
  const errors = [];
  const warnings = [];
  const tags = new Set();

  if (!code.trim()) {
    errors.push('代码为空');
  }
  if (/```/.test(code)) {
    errors.push('代码中仍包含 Markdown 代码围栏');
  }
  if (CONTROL_CHARACTERS.test(code)) {
    errors.push('代码中包含非法的不可打印控制字符');
  }
  if (/\/dev\/fb\d*/.test(code)) {
    errors.push('禁止直接访问 /dev/fb* framebuffer 设备');
  }
  if (/display\.Display\s*\([^)]*device\s*=/.test(code)) {
    errors.push('display.Display() 不应传入 framebuffer device 参数');
  }
  if (/\bimage\.new\s*\(/.test(code)) {
    errors.push('检测到旧版 image.new API，应使用 image.Image()');
  }
  if (/\bdisplay\.show\s*\(/.test(code)) {
    errors.push('检测到旧版全局 display.show API，应使用 display.Display().show()');
  }

  if (/\bdisplay\./.test(code)) {
    tags.add('display');
    if (!hasImport(code, 'display')) errors.push('使用 display API 但未导入 maix.display');
    if (!/\bdisplay\.Display\s*\(/.test(code)) {
      errors.push('使用显示功能但未初始化 display.Display()');
    }
  }

  if (/\bcamera\./.test(code) || /\bcam\.read\s*\(/.test(code)) {
    tags.add('camera');
    if (!hasImport(code, 'camera')) errors.push('使用摄像头 API 但未导入 maix.camera');
    if (!/\bcamera\.Camera\s*\(/.test(code)) {
      errors.push('使用摄像头功能但未初始化 camera.Camera()');
    }
  }

  if (/\bimage\./.test(code)) {
    tags.add('image');
    if (!hasImport(code, 'image')) errors.push('使用图像 API 但未导入 maix.image');
  }
  if (/\btouchscreen\./.test(code)) tags.add('touch');
  if (/\bnn\./.test(code)) tags.add('vision');
  if (/\baudio\.|\bpyaudio\b|\bwave\./.test(code)) tags.add('audio');
  if (/\/root\/models\/|\.mud\b/.test(code)) tags.add('model');
  if (/\buart\b/i.test(code)) tags.add('uart');
  if (/\bi2c\b/i.test(code)) tags.add('i2c');
  if (/\bgpio\b/i.test(code)) tags.add('gpio');

  if (/\bwhile\s+True\s*:/.test(code) && !/\bbreak\b|\bapp\.need_exit\s*\(/.test(code)) {
    warnings.push('检测到无显式退出条件的 while True，请确认停止机制');
  }
  if (!code.includes(APP_READY_MARKER)) {
    warnings.push(`建议初始化成功后输出 ${APP_READY_MARKER}`);
  }

  if (/os\.system\s*\(\s*['"](?:reboot|poweroff|halt)/i.test(code)) {
    errors.push('生成代码中包含重启或关机命令，请由独立设备控制按钮执行');
  }
  if (/shutil\.rmtree\s*\(\s*['"]\/['"]/.test(code)) {
    errors.push('生成代码包含危险的根目录删除操作');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    tags: [...tags],
    needsDisplay: tags.has('display'),
    needsCamera: tags.has('camera')
  };
}

export function summarizeDeviceOutput(output, maxLength = 4000) {
  const lines = String(output || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const errorLines = lines.filter((line) => ERROR_LINE_PATTERN.test(line));
  const usefulLines = lines.filter((line) => !NOISE_LINE_PATTERN.test(line));
  const selected = errorLines.length > 0 ? usefulLines.slice(-80) : usefulLines.slice(-30);
  return selected.join('\n').slice(-maxLength);
}
