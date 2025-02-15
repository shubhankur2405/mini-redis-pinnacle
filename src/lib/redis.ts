
type RedisValue = string | number;
type RedisEntry = {
  value: RedisValue;
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
    return entry.value;
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
}

export const redis = new MiniRedis();
