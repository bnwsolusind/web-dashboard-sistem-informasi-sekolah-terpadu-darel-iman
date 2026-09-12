/**
 * SIMS Terpadu - Web Realtime WebSocket Client
 * Zero-Delay synchronization for Web Chat & Real-Time Monitoring
 */

class WebRealtimeWebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
    this.subscribers = new Map();
    this.connect();
  }

  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname || 'localhost';
    const port = import.meta.env.VITE_WS_PORT || 6001;
    return `${protocol}//${hostname}:${port}`;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = this.getWebSocketUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Re-subscribe to all active channels
        for (const channel of this.subscribers.keys()) {
          this.send({ action: 'subscribe', channel });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const channel = data.channel;

          if (channel && this.subscribers.has(channel)) {
            const handlers = this.subscribers.get(channel);
            if (handlers) {
              handlers.forEach((handler) => handler(data));
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };
    } catch (e) {
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  subscribe(channel, handler) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
      this.send({ action: 'subscribe', channel });
    }

    this.subscribers.get(channel).add(handler);

    if (!this.isConnected) {
      this.connect();
    }

    return () => {
      this.unsubscribe(channel, handler);
    };
  }

  unsubscribe(channel, handler) {
    const handlers = this.subscribers.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscribers.delete(channel);
        this.send({ action: 'unsubscribe', channel });
      }
    }
  }
}

export const webRealtimeWs = new WebRealtimeWebSocketService();
