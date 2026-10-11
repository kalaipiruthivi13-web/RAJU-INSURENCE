/**
 * IndexedDB Binary Blob Storage for Raju Vendor Claims Documents & Bills
 * Overcomes localStorage ~5MB quota by storing actual binary Blobs and Files
 * in IndexedDB ('RajuVendorClaimsFilesDB').
 */

const DB_NAME = 'RajuVendorClaimsFilesDB';
const DB_VERSION = 1;
const STORE_NAME = 'claim_files';

// In-memory fallback map for environments without IndexedDB (e.g. Node.js tests)
const memoryStore = new Map();

function isIndexedDBAvailable() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB open error, falling back to memory store:', event.target.error);
      resolve(null);
    };
  });
}

/**
 * Store a file blob or data URL in IndexedDB with metadata
 * @param {string} fileId - Unique file ID
 * @param {Blob|File|string} blobOrDataUrl - Binary blob or Data URL
 * @param {Object} metadata - File metadata { name, type, size, claimId }
 */
export async function storeFileBlob(fileId, blobOrDataUrl, metadata = {}) {
  const record = {
    id: fileId,
    blob: blobOrDataUrl,
    name: metadata.name || 'document',
    type: metadata.type || 'application/pdf',
    size: metadata.size || (blobOrDataUrl.size || 0),
    claimId: metadata.claimId || null,
    savedAt: new Date().toISOString()
  };

  const db = await openDB();
  if (!db) {
    memoryStore.set(fileId, record);
    return fileId;
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => resolve(fileId);
      request.onerror = (e) => {
        console.warn('Failed to put file in IndexedDB, fallback to memory:', e.target.error);
        memoryStore.set(fileId, record);
        resolve(fileId);
      };
    } catch (err) {
      memoryStore.set(fileId, record);
      resolve(fileId);
    }
  });
}

/**
 * Retrieve a stored file blob and metadata by fileId
 * @param {string} fileId
 * @returns {Promise<Object|null>}
 */
export async function getFileBlob(fileId) {
  if (memoryStore.has(fileId)) {
    return memoryStore.get(fileId);
  }

  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(fileId);

      request.onsuccess = (event) => {
        resolve(event.target.result || null);
      };
      request.onerror = () => {
        resolve(null);
      };
    } catch (err) {
      resolve(null);
    }
  });
}

/**
 * Remove a file blob by fileId
 * @param {string} fileId
 */
export async function removeFileBlob(fileId) {
  memoryStore.delete(fileId);

  const db = await openDB();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(fileId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch (err) {
      resolve(false);
    }
  });
}

/**
 * Creates an object URL for previewing or downloading a stored file
 * @param {string} fileId
 * @returns {Promise<string|null>}
 */
export async function getFileObjectUrl(fileId) {
  const record = await getFileBlob(fileId);
  if (!record || !record.blob) return null;

  if (typeof record.blob === 'string') {
    // If it's already a Data URL or Blob URL
    return record.blob;
  }

  if (typeof window !== 'undefined' && window.URL && record.blob instanceof Blob) {
    return window.URL.createObjectURL(record.blob);
  }

  return null;
}
