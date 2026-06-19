import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedSearch } from '../types';

const STORAGE_KEY = 'redflag_history';
const MAX_HISTORY = 20;

// ─── Platform-aware storage wrappers ────────────────────────

async function readStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      // FIX: guard typeof localStorage for SSR / embedded webviews
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    // FIX: catch AsyncStorage errors to prevent unhandled rejections
    return null;
  }
}

async function writeStorage(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, value);
    } catch {
      /* quota exceeded */
    }
    return;
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // FIX: silent fail on storage write error
  }
}

async function removeStorage(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // FIX: silent fail on storage remove error
  }
}

// ─── Public API ───────────────────────────────────────────────

export async function getHistory(): Promise<SavedSearch[]> {
  try {
    const raw = await readStorage(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // FIX: defensive runtime validation to avoid crash if storage corrupted
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedSearch[];
  } catch {
    return [];
  }
}

export async function saveSearch(search: SavedSearch): Promise<void> {
  try {
    const history = await getHistory();
    const deduped = history.filter((h) => h.id !== search.id);
    deduped.unshift(search);
    await writeStorage(STORAGE_KEY, JSON.stringify(deduped.slice(0, MAX_HISTORY)));
  } catch {
    // Silent fail — history is non-critical
  }
}

export async function deleteSearch(id: string): Promise<void> {
  try {
    const history = await getHistory();
    const filtered = history.filter((h) => h.id !== id);
    await writeStorage(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export async function clearHistory(): Promise<void> {
  await removeStorage(STORAGE_KEY);
}

// FIX: RGPD / App Store 2023+ requirement — one-shot full data wipe.
// Removes EVERY piece of user-generated local data from the device.
// If new persisted keys are added to the app, append them to LOCAL_KEYS below.
const LOCAL_KEYS = [STORAGE_KEY];

export async function clearAllUserData(): Promise<void> {
  await Promise.all(LOCAL_KEYS.map((k) => removeStorage(k)));
}
