
import { RedisEntry, EvictionPolicy } from '../types/redis';

export const evictEntry = (
  store: Map<string, RedisEntry>,
  maxEntries: number,
  policy: EvictionPolicy
): void => {
  if (store.size <= maxEntries) return;

  const entries = Array.from(store.entries());
  let keyToEvict: string;

  if (policy === 'LRU') {
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    keyToEvict = entries[0][0];
  } else {
    entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
    keyToEvict = entries[0][0];
  }

  store.delete(keyToEvict);
};

export const updateAccessMetrics = (entry: RedisEntry): void => {
  entry.lastAccessed = Date.now();
  entry.accessCount = (entry.accessCount || 0) + 1;
};
