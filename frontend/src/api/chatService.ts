import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ApiResponse } from '../types/api';
import axiosInstance from './axiosInstance';

export interface ChatterDTO {
  userId: string;
  senderName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id?: number;
  senderId: string;
  senderName?: string;
  recipientId: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  type: 'USER' | 'GUEST' | 'ADMIN';
  isRead?: boolean;
  createdAt?: string;
}

class ChatService {
  private client: Client | null = null;
  private listeners: Set<(msg: ChatMessage) => void> = new Set();
  private currentUserId: string | null = null;

  connect(token: string | null, userId: string, onMessage: (msg: ChatMessage) => void) {
    this.listeners.add(onMessage);
    
    if (this.client?.connected && this.currentUserId === userId) {
      console.log('Already connected as ' + userId + ', adding listener only.');
      return;
    }

    if (this.client) {
      this.client.deactivate();
    }

    this.currentUserId = userId;
    const socket = new SockJS('http://localhost:8080/ws');
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (str: string) => console.log('[STOMP] ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
 
    this.client.onConnect = (frame: any) => {
      console.log('Connected: ' + frame + ' as user: ' + userId);
      
      this.client?.subscribe(`/topic/chat.messages.${userId}`, (message: any) => {
        const msg = JSON.parse(message.body);
        this.listeners.forEach(listener => listener(msg));
      });
 
      if (userId === 'ADMIN') {
        this.client?.subscribe('/topic/admin.messages', (message: any) => {
          const msg = JSON.parse(message.body);
          this.listeners.forEach(listener => listener(msg));
        });
      }
    };
 
    this.client.activate();
  }

  disconnect(onMessage: (msg: ChatMessage) => void) {
    this.listeners.delete(onMessage);
    // Only deactivate if no one is listening anymore
    if (this.listeners.size === 0 && this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  sendMessage(message: ChatMessage) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message),
      });
    }
  }

  async uploadMedia(file: File): Promise<string> {
    if (!file) throw new Error('Không có tệp tin được chọn');
    
    const formData = new FormData();
    formData.append('file', file);
    // Cloudinary standard resource types: image, video, raw
    const resourceType = file.type.startsWith('video') ? 'video' : 'image';
    formData.append('type', resourceType);
    
    const response = await axiosInstance.post<ApiResponse<string>>('/chat/upload', formData);
    return response.data.data;
  }

  async getHistory(userId: string): Promise<ChatMessage[]> {
    const response = await axiosInstance.get<ApiResponse<ChatMessage[]>>(`/chat/history/${userId}`);
    return response.data.data;
  }

  async getChatUsers(): Promise<ChatterDTO[]> {
    const response = await axiosInstance.get<ApiResponse<ChatterDTO[]>>('/admin/chat/users');
    return response.data.data;
  }

  async markAsRead(senderId: string, recipientId: string = 'ADMIN') {
    await axiosInstance.patch(`/chat/read/${senderId}?recipientId=${recipientId}`);
  }
}

export const chatService = new ChatService();
export default chatService;
