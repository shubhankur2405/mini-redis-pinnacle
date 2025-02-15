
type RedisValue = string | number;
type RedisEntry = {
  value: RedisValue | RedisValue[];
  type: 'string' | 'list';
  expiry?: number;
};

class MiniRedis {
  private store: Map<string, RedisEntry>;

  constructor() {
    this.store = new Map();
    this.cleanupExpired();
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
    const entry: RedisEntry = {
      value,
      type: 'string',
      expiry: ttl ? Date.now() + ttl * 1000 : undefined,
    };
    this.store.set(key, entry);
    return "OK";
  }

  get(key: string): RedisValue | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiry && entry.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    if (entry.type !== 'string') return null;
    return entry.value as RedisValue;
  }

  del(key: string): number {
    return this.store.delete(key) ? 1 : 0;
  }

  ttl(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (!entry.expiry) return -1;
    return Math.max(0, Math.floor((entry.expiry - Date.now()) / 1000));
  }

  // List Operations
  lpush(key: string, ...values: RedisValue[]): number {
    let entry = this.store.get(key);
    if (!entry) {
      entry = { value: [], type: 'list' };
      this.store.set(key, entry);
    } else if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    list.unshift(...values);
    return list.length;
  }

  rpush(key: string, ...values: RedisValue[]): number {
    let entry = this.store.get(key);
    if (!entry) {
      entry = { value: [], type: 'list' };
      this.store.set(key, entry);
    } else if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    list.push(...values);
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
    return list.shift() ?? null;
  }

  rpop(key: string): RedisValue | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    if (list.length === 0) return null;
    return list.pop() ?? null;
  }

  // Helper method to get list length
  llen(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }
    return (entry.value as RedisValue[]).length;
  }
}

export const redis = new MiniRedis();
