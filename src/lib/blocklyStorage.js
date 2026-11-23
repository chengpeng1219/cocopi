const DATABASE_NAME = 'cocopi-portal';
const DATABASE_VERSION = 1;
const STORE_NAME = 'blockly-workspaces';
const WORKSPACE_KEY = 'cocopi-blockly-workspace-v1';
const STORAGE_MODE_KEY = 'cocopi-blockly-storage-mode';
const LOCAL_STORAGE_LIMIT = 1_500_000;

let databasePromise;

function getLocalStorage() {
  try {
    return globalThis.localStorage || null;
  } catch (_) {
    return null;
  }
}

function openDatabase() {
  if (!globalThis.indexedDB) return Promise.resolve(null);
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve) => {
    const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return databasePromise;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function readWorkspaceStorageMode() {
  try {
    return getLocalStorage()?.getItem(STORAGE_MODE_KEY) || 'local';
  } catch (_) {
    return 'local';
  }
}

export function readLocalWorkspaceState() {
  if (readWorkspaceStorageMode() === 'indexeddb') return null;
  try {
    const saved = getLocalStorage()?.getItem(WORKSPACE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (_) {
    return null;
  }
}

function readLocalSnapshotIgnoringMode() {
  try {
    const saved = getLocalStorage()?.getItem(WORKSPACE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (_) {
    return null;
  }
}

export async function loadIndexedWorkspaceState() {
  const database = await openDatabase();
  if (!database) return readLocalSnapshotIgnoringMode();
  try {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const serialized = await requestToPromise(
      transaction.objectStore(STORE_NAME).get(WORKSPACE_KEY)
    );
    return serialized
      ? JSON.parse(serialized)
      : readLocalSnapshotIgnoringMode();
  } catch (_) {
    return readLocalSnapshotIgnoringMode();
  }
}

export async function saveWorkspaceState(state) {
  let serialized;
  try {
    serialized = JSON.stringify(state);
  } catch (error) {
    return { ok: false, storage: null, error };
  }

  let indexedSaved = false;
  const database = await openDatabase();
  if (database) {
    try {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(serialized, WORKSPACE_KEY);
      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      indexedSaved = true;
    } catch (_) {
      indexedSaved = false;
    }
  }

  const localStorage = getLocalStorage();
  try {
    if (serialized.length <= LOCAL_STORAGE_LIMIT) {
      localStorage?.setItem(WORKSPACE_KEY, serialized);
    } else {
      localStorage?.removeItem(WORKSPACE_KEY);
    }
    localStorage?.setItem(
      STORAGE_MODE_KEY,
      indexedSaved ? 'indexeddb' : 'local'
    );
  } catch (error) {
    if (indexedSaved) {
      try {
        localStorage?.removeItem(WORKSPACE_KEY);
        localStorage?.setItem(STORAGE_MODE_KEY, 'indexeddb');
      } catch (_) {
        // IndexedDB remains the source of truth.
      }
      return { ok: true, storage: 'indexeddb', error: null };
    }
    return { ok: false, storage: null, error };
  }

  return {
    ok: true,
    storage: indexedSaved ? 'indexeddb' : 'local',
    error: null
  };
}
