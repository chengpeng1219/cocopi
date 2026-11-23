export const DEBUG_LOG_STORAGE_KEY = 'cocopi.debug-log.v1';
export const DEBUG_LOG_SCHEMA_VERSION = 1;

const MAX_ENTRIES = 4000;
const MAX_MESSAGE_LENGTH = 8000;

let entries = null;
let activeSession = null;

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
    // Logging must never interrupt device operations or the UI.
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
  list.push({
    timestamp: new Date().toISOString(),
    sessionId: activeSession?.id || null,
    type: String(type || 'info'),
    message: String(message ?? '').slice(0, MAX_MESSAGE_LENGTH),
    ...metadata
  });
  if (list.length > MAX_ENTRIES) {
    list.splice(0, list.length - MAX_ENTRIES);
  }
  saveEntries();
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
  saveEntries();
}

export function downloadDebugLogs(metadata = {}) {
  if (typeof document === 'undefined' || typeof Blob === 'undefined') {
    return '';
  }
  const payload = getDebugLogExport(metadata);
  const stamp = new Date()
    .toISOString()
    .replaceAll(':', '')
    .replaceAll('-', '')
    .replace(/\.\d{3}Z$/, 'Z');
  const filename = `cocopi-debug-v${metadata.version || 'unknown'}-${stamp}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return filename;
}
