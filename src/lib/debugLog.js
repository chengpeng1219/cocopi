export const DEBUG_LOG_STORAGE_KEY = 'cocopi.debug-log.v1';
export const DEBUG_LOG_SCHEMA_VERSION = 1;

const MAX_ENTRIES = 4000;
const MAX_MESSAGE_LENGTH = 8000;

let entries = null;
let activeSession = null;
let pendingEntries = [];
let flushTimer = null;
let flushPromise = null;
let flushListenersInstalled = false;

function getStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function loadEntries() {
  if (entries) return entries;
  const storage = getStorage();
  try {
    const parsed = JSON.parse(storage?.getItem(DEBUG_LOG_STORAGE_KEY) || '[]');
    entries = Array.isArray(parsed) ? parsed : [];
  } catch {
    entries = [];
  }
  return entries;
}

function saveEntries() {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DEBUG_LOG_STORAGE_KEY, JSON.stringify(loadEntries()));
  } catch {
    try {
      entries = loadEntries().slice(-Math.floor(MAX_ENTRIES / 2));
      storage.setItem(DEBUG_LOG_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Logging must never interrupt device operations or the UI.
    }
  }
}

function createSessionId() {
  try {
    return globalThis.crypto?.randomUUID?.() || `session-${Date.now()}`;
  } catch {
    return `session-${Date.now()}`;
  }
}

function appendEntry(type, message, metadata = {}) {
  const list = loadEntries();
  const entry = {
    timestamp: new Date().toISOString(),
    sessionId: activeSession?.id || null,
    type: String(type || 'info'),
    message: String(message ?? '').slice(0, MAX_MESSAGE_LENGTH),
    ...metadata
  };
  list.push(entry);
  if (list.length > MAX_ENTRIES) {
    list.splice(0, list.length - MAX_ENTRIES);
  }
  saveEntries();
  pendingEntries.push(entry);
  if (pendingEntries.length > MAX_ENTRIES) {
    pendingEntries.splice(0, pendingEntries.length - MAX_ENTRIES);
  }
  scheduleFlush();
}

function scheduleFlush() {
  if (
    typeof window === 'undefined' ||
    typeof fetch !== 'function' ||
    flushTimer
  ) {
    return;
  }
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushDebugLogs();
  }, 1_000);
  flushTimer.unref?.();
}

function installFlushListeners() {
  if (flushListenersInstalled || typeof window === 'undefined') return;
  flushListenersInstalled = true;
  window.addEventListener('pagehide', () => {
    void flushDebugLogs({ keepalive: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void flushDebugLogs({ keepalive: true });
    }
  });
}

export async function flushDebugLogs({ keepalive = false } = {}) {
  if (
    flushPromise ||
    pendingEntries.length === 0 ||
    !activeSession ||
    typeof fetch !== 'function'
  ) {
    return flushPromise;
  }

  const batch = pendingEntries.splice(0, 500);
  flushPromise = fetch('/api/debug-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session: activeSession,
      entries: batch
    }),
    keepalive
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    })
    .catch(() => {
      pendingEntries.unshift(...batch);
      if (pendingEntries.length > MAX_ENTRIES) {
        pendingEntries.splice(0, pendingEntries.length - MAX_ENTRIES);
      }
      scheduleFlush();
    })
    .finally(() => {
      flushPromise = null;
      if (pendingEntries.length > 0) scheduleFlush();
    });
  return flushPromise;
}

export function startDebugSession(metadata = {}) {
  if (activeSession) return activeSession;
  activeSession = {
    id: createSessionId(),
    startedAt: new Date().toISOString(),
    version: metadata.version || '',
    userAgent:
      metadata.userAgent ||
      (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
    language:
      metadata.language ||
      (typeof navigator !== 'undefined' ? navigator.language : ''),
    timezone:
      metadata.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      '',
    entryUrl:
      metadata.entryUrl ||
      (typeof location !== 'undefined' ? location.href : '')
  };
  installFlushListeners();
  appendEntry('session.start', '调试日志会话开始', activeSession);
  return activeSession;
}

export function recordDebugLog(message, type = 'info', metadata = {}) {
  startDebugSession(metadata);
  appendEntry(type, message, metadata);
}

export function getDebugLogEntries() {
  return loadEntries().slice();
}

export function getDebugLogExport(metadata = {}) {
  const session = startDebugSession(metadata);
  return {
    schemaVersion: DEBUG_LOG_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    version: metadata.version || session.version,
    session,
    entries: getDebugLogEntries()
  };
}

export function clearDebugLogs() {
  entries = [];
  activeSession = null;
  pendingEntries = [];
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  saveEntries();
}
