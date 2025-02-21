
export type RedisValue = string | number;

export type RedisEntry = {
  value: RedisValue | RedisValue[];
  type: 'string' | 'list';
  expiry?: number;
  lastAccessed: number;
  accessCount: number;
};

export type Subscriber = (message: string) => void;

export type EvictionPolicy = 'LRU' | 'LFU';
