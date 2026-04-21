import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { chatService } from '../api/chatService';
import type { ChatMessage } from '../api/chatService';
import type { RootState } from '../store';
import { v4 as uuidv4 } from 'uuid';

export const useChat = (recipientId: string = 'ADMIN') => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  // Identify user or create guest ID
  const [currentUserId] = useState(() => {
    // If admin, always use 'ADMIN' as the ID for chat routing
    if (user?.role === 'ADMIN') return 'ADMIN';
    if (user?.email) return user.email;
    const existingGuestId = localStorage.getItem('glowzy_guest_id');
    if (existingGuestId) return existingGuestId;
    const newGuestId = `GUEST-${uuidv4().substring(0, 8)}`;
    localStorage.setItem('glowzy_guest_id', newGuestId);
    return newGuestId;
  });

  const [currentUserName] = useState(() => {
    if (user?.role === 'ADMIN') return 'Admin';
    if (user?.fullName) return user.fullName;
    return 'Khách hàng';
  });

  const loadHistory = useCallback(async () => {
    try {
      // If admin, fetch history for the recipient (guest). If guest, fetch for yourself.
      const targetId = currentUserId === 'ADMIN' ? recipientId : currentUserId;
      if (targetId && targetId !== 'ADMIN') {
        const history = await chatService.getHistory(targetId);
        setMessages(history);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, [currentUserId, recipientId]);

  useEffect(() => {
    const onMessage = (msg: ChatMessage) => {
      // Check if message is for the current conversation
      if ((msg.senderId === recipientId && msg.recipientId === currentUserId) ||
          (msg.senderId === currentUserId && msg.recipientId === recipientId)) {
        setMessages((prev) => {
          const isDuplicate = prev.some(m => {
            if (m.id && m.id === msg.id) return true;
            
            const sameContent = (m.content || '') === (msg.content || '');
            const sameMedia = (m.mediaUrl || '') === (msg.mediaUrl || '');
            const sameSender = m.senderId === msg.senderId;
            const diff = Math.abs(new Date(m.createdAt!).getTime() - new Date(msg.createdAt!).getTime());
            
            // Check for direct match (few seconds) OR exact timezone shift (7 hours)
            const isTimeMatch = diff < 10000 || Math.abs(diff - 7 * 3600 * 1000) < 10000;
            const duplicate = sameContent && sameMedia && sameSender && isTimeMatch;
            
            if (duplicate) console.log('[CHAT] Phát hiện tin nhắn trùng lặp (có thể do lệch múi giờ), đang bỏ qua.');
            return duplicate;
          });
          if (isDuplicate) return prev;
          return [...prev, msg];
        });
      }
      
      // Admin specific: Dispatch event for ANY incoming guest message to refresh sidebar
      if (currentUserId === 'ADMIN' && msg.senderId !== 'ADMIN' && msg.recipientId === 'ADMIN') {
        window.dispatchEvent(new CustomEvent('chat-new-reply', { detail: msg }));
      }

      // Guest specific: If it's a message from Admin for ME, increment unread for the widget
      if (currentUserId !== 'ADMIN' && msg.senderId === 'ADMIN' && msg.recipientId === currentUserId) {
        setUnreadCount((prev) => prev + 1);
        window.dispatchEvent(new CustomEvent('chat-new-reply', { detail: msg }));
      }
    };

    chatService.connect(token, currentUserId, onMessage);
    setIsConnected(true);
    loadHistory();

    return () => {
      chatService.disconnect(onMessage);
      setIsConnected(false);
    };
  }, [token, currentUserId, recipientId, loadHistory]);
  // @ts-ignore

  const sendMessage = async (content?: string, mediaFile?: File) => {
    let mediaUrl = undefined;
    let mediaType: 'IMAGE' | 'VIDEO' | undefined = undefined;

    if (mediaFile) {
      mediaUrl = await chatService.uploadMedia(mediaFile);
      mediaType = mediaFile.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
    }

    const message: ChatMessage = {
      senderId: currentUserId,
      senderName: currentUserName,
      recipientId: recipientId,
      content: content,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      type: user ? (user.role === 'ADMIN' ? 'ADMIN' : 'USER') : 'GUEST',
      createdAt: new Date().toISOString()
    };

    // Optimistic Update: Add message immediately for smoothness
    setMessages((prev) => {
      const isDuplicate = prev.some(m => 
        (m.content || '') === (message.content || '') && 
        (m.mediaUrl || '') === (message.mediaUrl || '') && 
        m.senderId === message.senderId && 
        Math.abs(new Date(m.createdAt!).getTime() - new Date(message.createdAt!).getTime()) < 1000
      );
      if (isDuplicate) return prev;
      return [...prev, { ...message, id: Date.now() }]; // Temporary ID
    });

    chatService.sendMessage(message);
  };

  const markAsRead = async () => {
    try {
      await chatService.markAsRead(currentUserId, recipientId);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return {
    messages,
    isConnected,
    unreadCount,
    currentUserId,
    sendMessage,
    markAsRead,
  };
};
