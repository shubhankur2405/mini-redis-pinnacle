
import { RedisValue, RedisEntry, EvictionPolicy } from './types/redis';
import { loadFromStorage, saveToStorage } from './utils/persistence';
import { evictEntry, updateAccessMetrics } from './utils/eviction';
import { PubSubHandler } from './utils/pubsub';

class MiniRedis {
  private store: Map<string, RedisEntry>;
  private pubsub: PubSubHandler;
  private maxEntries: number = 1000;
  private evictionPolicy: EvictionPolicy = 'LRU';

  constructor() {
    this.store = loadFromStorage();
    this.pubsub = new PubSubHandler();
    this.cleanupExpired();
    
    // Persist data periodically
    setInterval(() => saveToStorage(this.store), 5000);
  }

  private cleanupExpired() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.expiry && entry.expiry < now) {
          this.store.delete(key);
        }
      }
    }, 1000);
  }

  set(key: string, value: RedisValue, ttl?: number): string {
    evictEntry(this.store, this.maxEntries, this.evictionPolicy);
    const entry: RedisEntry = {
      value,
      type: 'string',
      expiry: ttl ? Date.now() + ttl * 1000 : undefined,
      lastAccessed: Date.now(),
      accessCount: 1
    };
    this.store.set(key, entry);
    saveToStorage(this.store);
    return "OK";
  }

  get(key: string): RedisValue | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiry && entry.expiry < Date.now()) {
      this.store.delete(key);
      saveToStorage(this.store);
      return null;
    }
    if (entry.type !== 'string') return null;
    
    updateAccessMetrics(entry);
    return entry.value as RedisValue;
  }

  del(key: string): number {
    const result = this.store.delete(key);
    saveToStorage(this.store);
    return result ? 1 : 0;
  }

  ttl(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (!entry.expiry) return -1;
    return Math.max(0, Math.floor((entry.expiry - Date.now()) / 1000));
  }

  lpush(key: string, ...values: RedisValue[]): number {
    evictEntry(this.store, this.maxEntries, this.evictionPolicy);
    let entry = this.store.get(key);
    if (!entry) {
      entry = { value: [], type: 'list', lastAccessed: Date.now(), accessCount: 1 };
      this.store.set(key, entry);
    } else if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    list.unshift(...values);
    updateAccessMetrics(entry);
    saveToStorage(this.store);
    return list.length;
  }

  rpush(key: string, ...values: RedisValue[]): number {
    evictEntry(this.store, this.maxEntries, this.evictionPolicy);
    let entry = this.store.get(key);
    if (!entry) {
      entry = { value: [], type: 'list', lastAccessed: Date.now(), accessCount: 1 };
      this.store.set(key, entry);
    } else if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    list.push(...values);
    updateAccessMetrics(entry);
    saveToStorage(this.store);
    return list.length;
  }

  lpop(key: string): RedisValue | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    if (list.length === 0) return null;
    
    updateAccessMetrics(entry);
    const result = list.shift() ?? null;
    saveToStorage(this.store);
    return result;
  }

  rpop(key: string): RedisValue | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    if (list.length === 0) return null;
    
    updateAccessMetrics(entry);
    const result = list.pop() ?? null;
    saveToStorage(this.store);
    return result;
  }

  llen(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }
    updateAccessMetrics(entry);
    return (entry.value as RedisValue[]).length;
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    this.pubsub.subscribe(channel, callback);
  }

  unsubscribe(channel: string, callback: (message: string) => void): void {
    this.pubsub.unsubscribe(channel, callback);
  }

  publish(channel: string, message: string): number {
    return this.pubsub.publish(channel, message);
  }

  setEvictionPolicy(policy: EvictionPolicy) {
    this.evictionPolicy = policy;
  }

  setMaxEntries(max: number) {
    this.maxEntries = max;
  }

  getMetrics(key: string) {
    const entry = this.store.get(key);
    if (entry) {
      return {
        lastAccessed: entry.lastAccessed,
        accessCount: entry.accessCount
      };
    }
    return null;
  }
}

export const redis = new MiniRedis();
