
import { Subscriber } from '../types/redis';

export class PubSubHandler {
  private subscribers: Map<string, Set<Subscriber>>;
  private broadcastChannel: BroadcastChannel;

  constructor() {
    this.subscribers = new Map();
    this.broadcastChannel = new BroadcastChannel('redis-pubsub');
    
    this.broadcastChannel.onmessage = (event) => {
      const { channel, message } = event.data;
      this.notifySubscribers(channel, message);
    };
  }

  notifySubscribers(channel: string, message: string): void {
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      for (const subscriber of channelSubscribers) {
        subscriber(message);
      }
    }
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
    this.notifySubscribers(channel, message);
    this.broadcastChannel.postMessage({ channel, message });
    return this.subscribers.get(channel)?.size || 0;
  }
}
