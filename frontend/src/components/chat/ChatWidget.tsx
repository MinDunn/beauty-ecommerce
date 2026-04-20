import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { messages, sendMessage, unreadCount, currentUserId, markAsRead } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (unreadCount > 0) {
        markAsRead();
      }
    }
  }, [messages, isOpen, unreadCount, markAsRead]);

  // Listen for new admin replies to show the temporary toast-label
  useEffect(() => {
    const handleNewReply = () => {
      if (!isOpen) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    };
    window.addEventListener('chat-new-reply', handleNewReply);
    return () => window.removeEventListener('chat-new-reply', handleNewReply);
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      await sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Dung lượng tệp tối đa là 20MB');
        return;
      }
      setIsUploading(true);
      try {
        await sendMessage(undefined, file);
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed bottom-[144px] md:bottom-[168px] right-6 z-[1001]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[280px] md:w-[320px] overflow-hidden flex flex-col mb-4 md:mb-4"
            style={{ 
              maxHeight: window.innerWidth < 768 ? '400px' : '500px', 
              height: window.innerWidth < 768 ? '60vh' : '70vh',
              marginTop: window.innerWidth < 768 ? '10px' : '0'
            }}
          >
            {/* Header */}
            <div className="bg-primary-500 p-4 md:p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="bg-white/20 p-1.5 md:p-2 rounded-full">
                  <User size={18} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base">Hỗ trợ trực tuyến</h3>
                  <p className="text-[10px] md:text-xs text-white/80">Chúng tôi phản hồi ngay</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 md:p-2 rounded-full transition-colors"
                title="Đóng chat"
              >
                <X size={18} className="md:w-5 md:h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-gray-50/50">
              {messages.length === 0 && (
                <div className="text-center py-6 md:py-10">
                  <div className="bg-primary-50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-primary-500">
                    <MessageCircle size={24} className="md:w-8 md:h-8" />
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm px-4">Chào bạn! Chúng tôi có thể giúp gì cho bạn?</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[80%] rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm ${isMe
                        ? 'bg-primary-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}>
                      {msg.content && <p className="text-xs md:text-sm leading-relaxed">{msg.content}</p>}

                      {msg.mediaUrl && msg.mediaType === 'IMAGE' && (
                        <img src={msg.mediaUrl} alt="chat" className="rounded-lg max-w-full mt-2 cursor-pointer transition-transform hover:scale-[1.02]" />
                      )}

                      {msg.mediaUrl && msg.mediaType === 'VIDEO' && (
                        <video src={msg.mediaUrl} controls className="rounded-lg max-w-full mt-2" />
                      )}

                      <span className={`text-[9px] md:text-[10px] block mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                        {msg.createdAt && format(new Date(msg.createdAt), 'HH:mm', { locale: vi })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isUploading && (
                <div className="flex justify-end">
                  <div className="bg-primary-100 text-primary-600 rounded-2xl p-3 md:p-4 animate-pulse italic text-[10px] md:text-xs">
                    Đang gửi tệp...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Overlay */}
            <form onSubmit={handleSend} className="p-3 md:p-4 bg-white border-t border-gray-100 flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-xs md:text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Paperclip size={18} className="md:w-5 md:h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isUploading}
                  className="bg-primary-500 text-white p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/30"
                >
                  <Send size={16} className="md:w-4 md:h-4" />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {showNotification && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-full mr-3 md:mr-4 top-1/2 -translate-y-1/2 px-3 py-2 md:px-4 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-2xl whitespace-nowrap"
            >
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Có tin nhắn mới</span>
              </div>
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-[5px] md:border-[6px] border-transparent border-l-slate-900" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="relative bg-primary-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-2xl shadow-2xl hover:bg-primary-600 transition-all flex items-center justify-center group"
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />

            {unreadCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] md:text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                {unreadCount}
              </div>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
