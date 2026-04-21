import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { type ChatterDTO, chatService } from '../../api/chatService';
import { User, Send, Search, MessageSquare, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminChat = () => {
  const [chatters, setChatters] = useState<ChatterDTO[]>([]);
  const [selectedChatter, setSelectedChatter] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { messages, sendMessage } = useChat(selectedChatter || 'ADMIN');
  const [firstUnreadIndex, setFirstUnreadIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchTimeoutRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatters = async () => {
    // Debounce sidebar refresh to avoid lag
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        const users = await chatService.getChatUsers();
        setChatters(users);
      } catch (error) {
        console.error('Failed to fetch chatters:', error);
      }
    }, 300);
  };

  useEffect(() => {
    fetchChatters();
    const interval = setInterval(fetchChatters, 30000);

    // Listen for new messages globally to refresh the list instantly
    const handleNewMessageAtAdmin = (e: any) => {
      const msg = e.detail;
      // If we are already looking at this chatter, mark as read automatically
      if (msg.senderId === selectedChatter) {
        chatService.markAsRead(msg.senderId, 'ADMIN').then(() => {
          fetchChatters();
        });
        
        // Mark where the "New Messages" start if not already marked
        const isFromGuest = msg.type !== 'ADMIN';
        if (isFromGuest && firstUnreadIndex === null) {
          setFirstUnreadIndex(messages.length);
        }
      } else {
        fetchChatters();
      }
    };
    window.addEventListener('chat-new-reply' as any, handleNewMessageAtAdmin);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chat-new-reply' as any, handleNewMessageAtAdmin);
    };
  }, [selectedChatter, messages.length, firstUnreadIndex]);

  // Reset marker when chatter changes
  useEffect(() => {
    setFirstUnreadIndex(null);
    if (selectedChatter) {
      chatService.markAsRead(selectedChatter, 'ADMIN').then(() => {
        fetchChatters(); // Refresh list to clear badge
      });
    }
  }, [selectedChatter]);

  useEffect(() => {
    if (selectedChatter) {
      scrollToBottom();
    }
  }, [messages, selectedChatter]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && selectedChatter) {
      setFirstUnreadIndex(null); // Clear indicator on admin reply
      await sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedChatter) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Dung lượng tệp tối đa là 20MB');
        return;
      }
      setIsUploading(true);
      try {
        await sendMessage(undefined, file);
      } catch (error: any) {
        console.error('Upload failed', error);
        const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
        alert(`Không thể gửi file. Nguyên nhân: ${errorMsg}\n\nVui lòng kiểm tra cấu hình Cloudinary trong file .env!`);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex h-[600px] md:h-[700px] bg-slate-900/50 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-500">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/80">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">Chat trực tuyến</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chatters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-600 p-6 text-center">
              <MessageSquare size={32} className="mb-3 opacity-20" />
              <p className="text-xs">Chưa có hội thoại nào</p>
            </div>
          ) : (
            chatters.map((chatter) => (
              <button
                key={chatter.userId}
                onClick={() => setSelectedChatter(chatter.userId)}
                className={`w-full p-5 flex items-center space-x-4 transition-all hover:bg-slate-800 border-b border-slate-800/20 ${
                  selectedChatter === chatter.userId ? 'bg-primary-500/10 border-r-4 border-primary-500' : ''
                }`}
              >
                <div className="relative">
                  <div className="bg-slate-700 p-2.5 rounded-2xl text-slate-400 group-hover:text-white transition-colors">
                    <User size={18} />
                  </div>
                  {chatter.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">{chatter.unreadCount}</span>
                    </div>
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`font-bold truncate text-sm ${chatter.unreadCount > 0 ? 'text-white' : 'text-slate-200'}`}>
                      {chatter.userId}
                    </p>
                    {chatter.lastMessageTime && (
                      <span className="text-[8px] text-slate-500 font-bold ml-2">
                        {format(new Date(chatter.lastMessageTime), 'HH:mm')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-black mt-1">
                    {chatter.unreadCount > 0 ? 'Tin mới' : 'Đã phản hồi'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900/40">
        {selectedChatter ? (
          <>
            {/* Header */}
            <div className="p-4 px-6 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary-500/20 p-2.5 rounded-2xl text-primary-500 border border-primary-500/20">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedChatter}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Trực tuyến</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.map((msg, idx) => {
                const isMe = msg.type === 'ADMIN';
                const showNewMessageMarker = idx === firstUnreadIndex;
                
                return (
                  <React.Fragment key={msg.id || idx}>
                    {showNewMessageMarker && (
                      <div className="flex items-center my-8">
                        <div className="flex-1 h-[1px] bg-red-500/30"></div>
                        <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-slate-900 px-3 py-1 rounded-full border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                          Tin nhắn mới
                        </span>
                        <div className="flex-1 h-[1px] bg-red-500/30"></div>
                      </div>
                    )}
                    <div 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-3xl p-5 shadow-2xl relative group ${
                        isMe 
                          ? 'bg-primary-500 text-white rounded-tr-none' 
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                      }`}>
                        {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                        
                        {msg.mediaUrl && msg.mediaType === 'IMAGE' && (
                          <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                            <img src={msg.mediaUrl} alt="chat-media" className="max-w-full" />
                          </div>
                        )}
                        
                        {msg.mediaUrl && msg.mediaType === 'VIDEO' && (
                          <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black">
                            <video src={msg.mediaUrl} controls className="max-w-full" />
                          </div>
                        )}

                        <span className={`text-[9px] font-black uppercase tracking-widest block mt-2 opacity-50 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                           {msg.createdAt && format(new Date(msg.createdAt), 'HH:mm', { locale: vi })}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              {isUploading && (
                <div className="flex justify-end">
                   <div className="bg-primary-500/10 border border-primary-500/20 text-primary-500 rounded-2xl p-4 animate-pulse italic text-xs">
                    Hệ thống đang tải tệp tin lên...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Overlay */}
            <form onSubmit={handleSend} className="p-6 bg-slate-900/60 border-t border-slate-800">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-2 flex items-center space-x-3">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập phản hồi tư vấn..."
                  className="flex-1 px-4 py-3 bg-transparent text-white outline-none text-sm placeholder:text-slate-600 font-medium"
                />
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
                    title="Gửi tệp đính kèm"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button 
                    type="submit"
                    disabled={!inputValue.trim() || isUploading}
                    className="bg-primary-500 text-white px-5 py-3 rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center space-x-2 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-500/20 active:scale-95"
                  >
                    <span>Gửi phản hồi</span>
                    <Send size={14} />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,video/*"
                />
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-6">
            <div className="bg-slate-800/10 p-12 rounded-[3rem] border border-slate-800/50 shadow-inner group">
              <MessageSquare size={80} className="text-slate-800 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-slate-300 font-black uppercase tracking-[0.2em] text-lg">Trung tâm tư vấn</h4>
              <p className="text-xs font-medium text-slate-500 max-w-xs leading-relaxed italic">Chọn một khách hàng từ danh sách bên trái để bắt đầu hỗ trợ trực tuyến.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
