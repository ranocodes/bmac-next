const STORE_PREFIX = "bmac_admin_";

function getKey(k: string) { return `${STORE_PREFIX}${k}`; }

export function getAll<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  return getAll<T>(key).find(i => i.id === id);
}

export function create<T extends { id: string }>(key: string, item: T): T {
  const items = getAll<T>(key);
  items.push(item);
  localStorage.setItem(getKey(key), JSON.stringify(items));
  return item;
}

export function update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | undefined {
  const items = getAll<T>(key);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...updates };
  localStorage.setItem(getKey(key), JSON.stringify(items));
  return items[idx];
}

export function remove(key: string, id: string): boolean {
  const items = getAll<any>(key);
  const filtered = items.filter((i: any) => i.id !== id);
  if (filtered.length === items.length) return false;
  localStorage.setItem(getKey(key), JSON.stringify(filtered));
  return true;
}

export function setItem<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getKey(key), JSON.stringify(value));
}

export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function removeItem(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getKey(key));
}

export function seedIfEmpty<T extends { id: string }>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(getKey(key))) {
    localStorage.setItem(getKey(key), JSON.stringify(data.map((d, i) => ({ ...d, id: d.id || `${key}-${i}` }))));
  }
}
