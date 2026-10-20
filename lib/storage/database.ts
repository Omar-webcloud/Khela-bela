/**
 * Local IndexedDB database manager for KhelaBela
 */

const DB_NAME = 'khelabela';
const DB_VERSION = 1;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('matches')) {
        db.createObjectStore('matches', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('saved_games')) {
        db.createObjectStore('saved_games', {keyPath: 'game'});
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
