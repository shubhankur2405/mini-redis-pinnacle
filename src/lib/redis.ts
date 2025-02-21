
type RedisValue = string | number;
type RedisEntry = {
  value: RedisValue | RedisValue[];
  type: 'string' | 'list';
  expiry?: number;
  lastAccessed: number; // For LRU
  accessCount: number;  // For LFU
};

type Subscriber = (message: string) => void;

class MiniRedis {
  private store: Map<string, RedisEntry>;
  private subscribers: Map<string, Set<Subscriber>>;
  private broadcastChannel: BroadcastChannel;
  private maxEntries: number = 1000; // Maximum number of entries before eviction
  private evictionPolicy: 'LRU' | 'LFU' = 'LRU'; // Default to LRU

  constructor() {
    this.store = new Map();
    this.subscribers = new Map();
    this.broadcastChannel = new BroadcastChannel('redis-pubsub');
    this.loadFromStorage();
    this.cleanupExpired();
    
    // Listen for messages from other tabs
    this.broadcastChannel.onmessage = (event) => {
      const { channel, message } = event.data;
      this.notifySubscribers(channel, message);
    };

    // Persist data periodically
    setInterval(() => this.saveToStorage(), 5000);
  }

  private loadFromStorage() {
    try {
      const savedData = localStorage.getItem('mini-redis-data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.store = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.store);
      localStorage.setItem('mini-redis-data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  private evict() {
    if (this.store.size <= this.maxEntries) return;

    const entries = Array.from(this.store.entries());
    let keyToEvict: string;

    if (this.evictionPolicy === 'LRU') {
      // Sort by last accessed time and remove oldest
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      keyToEvict = entries[0][0];
    } else {
      // LFU: Sort by access count and remove least frequently used
      entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
      keyToEvict = entries[0][0];
    }

    this.store.delete(keyToEvict);
  }

  private updateAccessMetrics(key: string) {
    const entry = this.store.get(key);
    if (entry) {
      entry.lastAccessed = Date.now();
      entry.accessCount = (entry.accessCount || 0) + 1;
    }
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
    this.evict(); // Check if eviction is needed
    const entry: RedisEntry = {
      value,
      type: 'string',
      expiry: ttl ? Date.now() + ttl * 1000 : undefined,
      lastAccessed: Date.now(),
      accessCount: 1
    };
    this.store.set(key, entry);
    this.saveToStorage();
    return "OK";
  }

  get(key: string): RedisValue | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiry && entry.expiry < Date.now()) {
      this.store.delete(key);
      this.saveToStorage();
      return null;
    }
    if (entry.type !== 'string') return null;
    
    this.updateAccessMetrics(key);
    return entry.value as RedisValue;
  }

  del(key: string): number {
    const result = this.store.delete(key);
    this.saveToStorage();
    return result ? 1 : 0;
  }

  ttl(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (!entry.expiry) return -1;
    return Math.max(0, Math.floor((entry.expiry - Date.now()) / 1000));
  }

  lpush(key: string, ...values: RedisValue[]): number {
    this.evict();
    let entry = this.store.get(key);
    if (!entry) {
      entry = { value: [], type: 'list', lastAccessed: Date.now(), accessCount: 1 };
      this.store.set(key, entry);
    } else if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    list.unshift(...values);
    this.updateAccessMetrics(key);
    this.saveToStorage();
    return list.length;
  }

  rpush(key: string, ...values: RedisValue[]): number {
    this.evict();
    let entry = this.store.get(key);
    if (!entry) {
      entry = { value: [], type: 'list', lastAccessed: Date.now(), accessCount: 1 };
      this.store.set(key, entry);
    } else if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }

    const list = entry.value as RedisValue[];
    list.push(...values);
    this.updateAccessMetrics(key);
    this.saveToStorage();
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
    
    this.updateAccessMetrics(key);
    const result = list.shift() ?? null;
    this.saveToStorage();
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
    
    this.updateAccessMetrics(key);
    const result = list.pop() ?? null;
    this.saveToStorage();
    return result;
  }

  llen(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    if (entry.type !== 'list') {
      throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value');
    }
    this.updateAccessMetrics(key);
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

  // New method to configure eviction policy
  setEvictionPolicy(policy: 'LRU' | 'LFU') {
    this.evictionPolicy = policy;
  }

  // New method to set maximum entries
  setMaxEntries(max: number) {
    this.maxEntries = max;
  }
}

export const redis = new MiniRedis();
