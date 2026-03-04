import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedSearch } from '../types';

const STORAGE_KEY = 'redflag_history';
const MAX_HISTORY = 20;

// ─── Platform-aware storage wrappers ────────────────────────

async function readStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  return AsyncStorage.getItem(key);
}

async function writeStorage(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, value); } catch { /* quota exceeded */ }
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function removeStorage(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return;
  }
  await AsyncStorage.removeItem(key);
}

// ─── Public API ───────────────────────────────────────────────

export async function getHistory(): Promise<SavedSearch[]> {
  try {
    const raw = await readStorage(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
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
