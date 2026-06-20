import { FileRecord } from '../types';

const STORAGE_KEY = 'altera_recently_viewed';
const MAX_ITEMS = 5;

export function addRecentlyViewed(file: FileRecord) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: FileRecord[] = stored ? JSON.parse(stored) : [];
    items = items.filter(f => f.id !== file.id);
    items.unshift(file);
    if (items.length > MAX_ITEMS) items = items.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore quota errors */ }
}

export function getRecentlyViewed(): FileRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}
