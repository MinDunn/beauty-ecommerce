import type { ApiResponse } from '../types/api';
import axiosInstance from './axiosInstance';
import socketService from './socketService';

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
  private currentUserId: string | null = null;
  private activeSubscriptions: Map<string, (msg: ChatMessage) => void> = new Map();

  async connect(token: string | null, userId: string, onMessage: (msg: ChatMessage) => void) {
    if (this.currentUserId && this.currentUserId !== userId) {
      this.disconnectAll();
    }

    this.currentUserId = userId;
    
    try {
      await socketService.connect(token);
      
      const chatTopic = `/topic/chat.messages.${userId}`;
      if (!this.activeSubscriptions.has(chatTopic)) {
        socketService.subscribe(chatTopic, onMessage);
        this.activeSubscriptions.set(chatTopic, onMessage);
      }

      if (userId === 'ADMIN') {
        const adminTopic = '/topic/admin.messages';
        if (!this.activeSubscriptions.has(adminTopic)) {
          socketService.subscribe(adminTopic, onMessage);
          this.activeSubscriptions.set(adminTopic, onMessage);
        }
      }
    } catch (error) {
      console.error('Failed to connect to socket service', error);
    }
  }

  disconnect(onMessage: (msg: ChatMessage) => void) {
    this.activeSubscriptions.forEach((cb, topic) => {
      if (cb === onMessage) {
        socketService.unsubscribe(topic, cb);
        this.activeSubscriptions.delete(topic);
      }
    });
  }

  private disconnectAll() {
    this.activeSubscriptions.forEach((cb, topic) => {
      socketService.unsubscribe(topic, cb);
    });
    this.activeSubscriptions.clear();
    this.currentUserId = null;
  }

  sendMessage(message: ChatMessage) {
    socketService.publish('/app/chat.sendMessage', message);
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
