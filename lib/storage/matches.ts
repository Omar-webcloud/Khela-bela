import type {Summary} from '../types';
import {openDatabase} from './database';
import {getHouseRules, getPref, setHouseRules, setPref} from './preferences';

export async function saveMatch(m: Summary): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('matches', 'readwrite');
      const store = tx.objectStore('matches');
      const req = store.put(m);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Graceful fallback to localStorage if IndexedDB fails
    const local = getPref<Summary[]>('matches_fallback', []);
    const updated = [m, ...local.filter(x => x.id !== m.id)].slice(0, 20);
    setPref('matches_fallback', updated);
  }
}

export async function listMatches(): Promise<Summary[]> {
  try {
    const db = await openDatabase();
    return await new Promise<Summary[]>((resolve) => {
      const tx = db.transaction('matches', 'readonly');
      const store = tx.objectStore('matches');
      const req = store.getAll();
      req.onsuccess = () => {
        const matches = (req.result as Summary[] || [])
          .filter(x => x && x.id && x.game)
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
          .slice(0, 15);
        resolve(matches);
      };
      req.onerror = () => resolve(getPref<Summary[]>('matches_fallback', []));
    });
  } catch {
    return getPref<Summary[]>('matches_fallback', []);
  }
}

export async function clearMatches(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve) => {
      const tx = db.transaction('matches', 'readwrite');
      const store = tx.objectStore('matches');
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {}
  setPref('matches_fallback', []);
}

export async function exportAllData(): Promise<string> {
  const matches = await listMatches();
  const houseRules = getHouseRules();
  const exportPayload = {
    app: 'KhelaBela',
    version: '3.0',
    exportedAt: new Date().toISOString(),
    matches,
    houseRules,
    preferences: {
      lang: getPref('lang', 'en'),
      mode: getPref('mode', 'computer'),
      diff: getPref('diff', 'medium'),
      sound: getPref('sound', true),
    },
  };
  return JSON.stringify(exportPayload, null, 2);
}

export async function importData(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.houseRules) {
      setHouseRules(parsed.houseRules);
    }
    if (parsed.preferences) {
      Object.entries(parsed.preferences).forEach(([k, v]) => setPref(k, v));
    }
    if (Array.isArray(parsed.matches)) {
      for (const m of parsed.matches) {
        if (m.id && m.game) {
          await saveMatch(m);
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}
