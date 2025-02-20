type RedisValue = string | number;
type RedisEntry = {
  value: RedisValue | RedisValue[];
  type: 'string' | 'list';
  expiry?: number;
};

type Subscriber = (message: string) => void;

class MiniRedis {
  private store: Map<string, RedisEntry>;
  private subscribers: Map<string, Set<Subscriber>>;
  private broadcastChannel: BroadcastChannel;

  constructor() {
    this.store = new Map();
    this.subscribers = new Map();
    this.broadcastChannel = new BroadcastChannel('redis-pubsub');
    this.cleanupExpired();
    
    // Listen for messages from other tabs
    this.broadcastChannel.onmessage = (event) => {
      const { channel, message } = event.data;
      this.notifySubscribers(channel, message);
    };
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

  private notifySubscribers(channel: string, message: string) {
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      for (const subscriber of channelSubscribers) {
        subscriber(message);
      }
    }
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

  llen(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }
    return (entry.value as RedisValue[]).length;
  }

  subscribe(channel: string, callback: Subscriber): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)?.add(callback);
  }

  unsubscribe(channel: string, callback: Subscriber): void {
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      channelSubscribers.delete(callback);
      if (channelSubscribers.size === 0) {
        this.subscribers.delete(channel);
      }
    }
  }

  publish(channel: string, message: string): number {
    // Notify subscribers in current tab
    this.notifySubscribers(channel, message);
    
    // Broadcast to other tabs
    this.broadcastChannel.postMessage({ channel, message });
    
    const subscribers = this.subscribers.get(channel)?.size || 0;
    return subscribers;
  }
}

export const redis = new MiniRedis();
