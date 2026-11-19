/*
 * 终端输出的噪声过滤与频率限制。
 * 设备侧很多库（Maix multimedia、i2c、fbtft 等）会持续打印无信息量的日志，
 * 直接透传会让终端日志爆炸，还会把有价值的信息挤出窗口。
 */

// 整行判定：命中即丢弃
const NOISE_LINE_PATTERNS = [
  /^-- \[[IWE]\]/, // Maix 日志前缀
  /^\[SAMPLE-/, // 板端 sample 驱动输出
  /^\[COMM_/,
  /^\[COMMON_/,
  /^\[CocoPi\] (屏幕文字渲染程序|摄像头)已?启动/, // 脚本自身的启动横幅
  /maix multi-media driver/i,
  /^AX_/,
  /^i2c_init:/i,
  /auto set pinmap/i,
  /^listening on uart/i,
  /^init fb0 done$/i,
  /^used count:/i,
  /^\[ADB (有线|输出流)\]/ // 连接层的重复提示
];

// 同一行在同一时间窗内只保留一次
const DEDUPE_WINDOW_MS = 10_000;
// 连续刷屏时，重复次数超过该值后合并成一条计数
const BURST_THRESHOLD = 3;
const MAX_LINE_LENGTH = 2000;
const MAX_LOG_ENTRIES = 400;
const IMPORTANT_DEVICE_PATTERN =
  /Traceback|SyntaxError|ImportError|ModuleNotFoundError|NameError|AttributeError|TypeError|ValueError|RuntimeError|OSError|PermissionError|FileNotFoundError|failed|error:|错误|失败|超时|timed out|^-- \[[EW]\]|\[APP_READY\]|\[CocoPi\]/i;

export function isNoiseLine(line) {
  const text = String(line ?? '').trim();
  if (!text) return true;
  return NOISE_LINE_PATTERNS.some((pattern) => pattern.test(text));
}

export function truncateLine(line, maxLength = MAX_LINE_LENGTH) {
  const text = String(line ?? '');
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)} …（该行共 ${text.length} 字符，已截断）`;
}

export function isImportantDeviceOutput(line) {
  const text = String(line ?? '').trim();
  if (!text) return false;
  return IMPORTANT_DEVICE_PATTERN.test(text);
}

/** 用于合并提示里的行摘要，避免把一整行日志塞进提示语 */
function shorten(line, maxLength = 60) {
  return line.length <= maxLength ? line : `${line.slice(0, maxLength)}…`;
}

function createLogFilter() {
  return new Map();
}

/**
 * 返回一个函数：传入一行文本，必要时返回需要写入日志的条目数组。
 * 被过滤掉的行返回空数组；重复行返回一条 "… 重复 N 次" 的合并条目。
 */
export function createTerminalThrottle(now = () => Date.now()) {
  const seen = createLogFilter();

  return function filterLine(rawLine) {
    const line = truncateLine(String(rawLine ?? '').trim());
    if (!line || isNoiseLine(line)) return [];

    const timestamp = now();
    const lastSeen = seen.get(line);

    if (lastSeen && timestamp - lastSeen.at < DEDUPE_WINDOW_MS) {
      lastSeen.count += 1;
      if (lastSeen.count === BURST_THRESHOLD) {
        return [
          {
            text: `… 「${shorten(line)}」在短时间内重复输出，后续相同内容已合并（另有 ${
              lastSeen.count - 1
            } 次）`,
            type: 'info'
          }
        ];
      }
      // 合并提示之后如果继续刷屏，把窗口往后推，避免刷屏结束后立刻再打印一遍
      if (lastSeen.count > BURST_THRESHOLD) lastSeen.at = timestamp;
      return [];
    }

    // 超过窗口，或首次出现
    seen.set(line, { at: timestamp, count: 1 });
    if (seen.size > 500) {
      for (const [key, value] of seen) {
        if (timestamp - value.at >= DEDUPE_WINDOW_MS) seen.delete(key);
      }
    }

    return [{ text: line, type: null }];
  };
}

export function appendTerminalEntry(entries, entry) {
  const next = [...entries, entry];
  if (next.length <= MAX_LOG_ENTRIES) return next;

  const dropped = next.length - MAX_LOG_ENTRIES;
  return [
    ...next.slice(dropped),
    {
      time: entry.time,
      type: 'info',
      text: `… 已省略较早的 ${dropped} 条输出，可点击「清空」重新开始`
    }
  ];
}
