
import { RedisEntry } from '../types/redis';

export const loadFromStorage = (): Map<string, RedisEntry> => {
  try {
    const savedData = localStorage.getItem('mini-redis-data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.error('Error loading data from storage:', error);
  }
  return new Map();
};

export const saveToStorage = (store: Map<string, RedisEntry>): void => {
  try {
    const data = Object.fromEntries(store);
    localStorage.setItem('mini-redis-data', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to storage:', error);
  }
};
