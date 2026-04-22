import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type SocketCallback = (message: any) => void;

class SocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();
  private callbacks: Map<string, Set<SocketCallback>> = new Map();
  private isConnected: boolean = false;

  /**
   * Connect to the WebSocket server
   */
  connect(token: string | null): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        resolve();
        return;
      }

      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '/ws') || 'http://localhost:8080/ws';
      const socket = new SockJS(socketUrl);

      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (str: string) => {
          if (import.meta.env.DEV) console.log('[STOMP] ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        this.isConnected = true;
        console.log('STOMP connected: ' + frame);
        
        // Re-subscribe to all existing topics on reconnection
        this.subscriptions.clear();
        this.callbacks.forEach((_, topic) => {
          this.subscribeToTopic(topic);
        });
        
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP error: ' + frame.headers['message']);
        reject(frame);
      };

      this.client.onWebSocketClose = () => {
        this.isConnected = false;
        console.log('STOMP connection closed');
      };

      this.client.activate();
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.subscriptions.clear();
      this.callbacks.clear();
    }
  }

  /**
   * Subscribe to a specific topic
   */
  subscribe(topic: string, callback: SocketCallback) {
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, new Set());
    }
    
    this.callbacks.get(topic)?.add(callback);

    // If already connected, perform the actual STOMP subscription
    if (this.isConnected) {
      this.subscribeToTopic(topic);
    }
  }

  /**
   * Internal method to handle actual STOMP subscription
   */
  private subscribeToTopic(topic: string) {
    if (!this.client || !this.client.connected || this.subscriptions.has(topic)) {
      return;
    }

    const sub = this.client.subscribe(topic, (message) => {
      const body = JSON.parse(message.body);
      console.log(`[SocketService] Received message on ${topic}:`, body);
      this.callbacks.get(topic)?.forEach(cb => cb(body));
    });

    console.log(`[SocketService] Subscribed to topic: ${topic}`);
    this.subscriptions.set(topic, sub);
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string, callback: SocketCallback) {
    const topicCallbacks = this.callbacks.get(topic);
    if (topicCallbacks) {
      topicCallbacks.delete(callback);
      if (topicCallbacks.size === 0) {
        this.subscriptions.get(topic)?.unsubscribe();
        this.subscriptions.delete(topic);
        this.callbacks.delete(topic);
      }
    }
  }

  /**
   * Publish a message to a destination
   */
  publish(destination: string, body: any) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('Cannot publish: STOMP client not connected');
    }
  }
}

export const socketService = new SocketService();
export default socketService;
