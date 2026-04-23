import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';


const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [botWelcomeShown, setBotWelcomeShown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [proactiveGreeting, setProactiveGreeting] = useState(false);
  
  // Debug to ensure read
  useEffect(() => {
    if (proactiveGreeting) console.log('[CHAT] Hiển thị lời chào chủ động');
  }, [proactiveGreeting]);
  const { user } = useSelector((state: RootState) => state.auth);
  const { messages, sendMessage, unreadCount, currentUserId, markAsRead } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Bot chủ động nhắn trước sau 5 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0 && !botWelcomeShown) {
        setProactiveGreeting(true);
        // Hiển thị thông báo tin nhắn mới
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 8000);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, messages.length, botWelcomeShown]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setProactiveGreeting(false);
      if (unreadCount > 0) {
        markAsRead();
      }
      
      // Khi mở chat, nếu chưa chào thì chào
      if (!botWelcomeShown && messages.length === 0) {
        setBotWelcomeShown(true);
      }
    }
  }, [messages, isOpen, unreadCount, markAsRead, botWelcomeShown]);

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
      const text = inputValue.trim();
      setInputValue('');
      await sendMessage(text);
      await handleAutoResponse(text);
    }
  };

  const handleAutoResponse = async (text: string) => {
    const responses: Record<string, string> = {
      "🔍 Kiểm tra đơn hàng": "Glowzy xin chào! Để kiểm tra đơn hàng, bạn vui lòng cung cấp **Mã đơn hàng** hoặc **Số điện thoại** đặt hàng để hệ thống tra cứu giúp bạn ngay nhé! 📦",
      "🌿 Tư vấn chọn sản phẩm": "Chào bạn! Bạn đang quan tâm đến dòng sản phẩm nào (Làm sạch, Dưỡng ẩm, hay Đặc trị mụn...) và thuộc loại da gì để Glowzy tư vấn kỹ hơn cho bạn ạ? ✨",
      "🎁 Khuyến mãi hiện có": "Hiện tại Glowzy đang có chương trình 'DEAL HÈ RỰC RỠ' giảm đến 30% cho các dòng Kem chống nắng và Voucher 20k cho đơn từ 299k. Bạn có muốn nhận link xem chi tiết không ạ? 🔥",
      "👩‍💼 Gặp tư vấn viên": "Dạ vâng, yêu cầu của bạn đã được chuyển đến tư vấn viên. Vui lòng đợi trong giây lát, chúng tôi sẽ phản hồi bạn ngay ạ! 🎧"
    };

    const response = responses[text];
    if (response) {
      setIsBotTyping(true);
      setTimeout(() => {
        setIsBotTyping(false);
      }, 1500);
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
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[280px] md:w-[350px] overflow-hidden flex flex-col mb-4 md:mb-4"
            style={{ 
              maxHeight: '600px',
              height: window.innerWidth < 768 ? '60vh' : '75vh',
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 md:p-5 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-white/20 p-2 rounded-full border border-white/30">
                    <User size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base tracking-tight">Hỗ trợ trực tuyến</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <p className="text-[10px] md:text-xs text-white/80">Đang trực tuyến</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-all active:scale-90"
                title="Đóng chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-2xl p-3.5 shadow-sm bg-white text-gray-800 border border-gray-100 rounded-tl-none">
                      <p className="text-xs md:text-sm leading-relaxed">
                        {user ? (
                          <>Chào <strong>{user.fullName || 'bạn'}</strong>, mừng bạn quay lại với <strong>Glowzy</strong>! ✨</>
                        ) : (
                          <>Chào mừng bạn đến với <strong className="text-primary-500">Glowzy</strong>! 🌸</>
                        )}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-2xl p-3.5 shadow-sm bg-white text-gray-800 border border-gray-100 rounded-tl-none">
                      <p className="text-xs md:text-sm leading-relaxed">
                        Bạn cần hỗ trợ gì hôm nay ạ? Chọn nhanh bên dưới hoặc nhắn tin cho mình nhé! 👇
                      </p>
                    </div>
                  </motion.div>

                  {/* Quick Reply Suggestions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0 }}
                    className="flex flex-col gap-2 pt-2"
                  >
                    {[
                      { text: "🔍 Kiểm tra đơn hàng", color: "bg-blue-50 text-blue-600 border-blue-100" },
                      { text: "🌿 Tư vấn chọn sản phẩm", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                      { text: "🎁 Khuyến mãi hiện có", color: "bg-rose-50 text-rose-600 border-rose-100" },
                      { text: "👩‍💼 Gặp tư vấn viên", color: "bg-amber-50 text-amber-600 border-amber-100" }
                    ].map((item) => (
                      <button
                        key={item.text}
                        onClick={() => {
                          sendMessage(item.text);
                          handleAutoResponse(item.text);
                        }}
                        className={`text-[11px] md:text-xs px-4 py-2.5 rounded-xl border transition-all text-left flex items-center justify-between group hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${item.color}`}
                      >
                        <span>{item.text}</span>
                        <Send size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </motion.div>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id || idx}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${isMe
                        ? 'bg-primary-500 text-white rounded-tr-none shadow-primary-200'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}>
                      {msg.content && <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                      {msg.mediaUrl && msg.mediaType === 'IMAGE' && (
                        <img src={msg.mediaUrl} alt="chat" className="rounded-lg max-w-full mt-2 cursor-pointer transition-transform hover:scale-[1.02]" />
                      )}

                      {msg.mediaUrl && msg.mediaType === 'VIDEO' && (
                        <video src={msg.mediaUrl} controls className="rounded-lg max-w-full mt-2" />
                      )}

                      <span className={`text-[9px] block mt-1.5 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                        {msg.createdAt && format(new Date(msg.createdAt), 'HH:mm', { locale: vi })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
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
          {proactiveGreeting && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute right-0 bottom-full mb-4 w-64 bg-white rounded-2xl shadow-2xl p-4 border border-primary-100"
            >
              <button 
                onClick={() => setProactiveGreeting(false)}
                className="absolute -top-2 -right-2 bg-gray-100 text-gray-500 rounded-full p-1 hover:bg-gray-200"
              >
                <X size={12} />
              </button>
              <div className="flex items-start space-x-3">
                <div className="bg-primary-500 p-1.5 rounded-full text-white mt-1">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Glowzy Support</p>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Chào bạn! Bạn cần tư vấn về sản phẩm hay ưu đãi hôm nay không ạ? ✨
                  </p>
                </div>
              </div>
              <div className="absolute top-full right-6 w-3 h-3 bg-white border-r border-b border-primary-100 rotate-45 -translate-y-1.5"></div>
            </motion.div>
          )}

          {showNotification && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-full mr-3 md:mr-4 top-1/2 -translate-y-1/2 px-3 py-2 md:px-4 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold shadow-2xl whitespace-nowrap"
            >
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Bạn có tin nhắn mới</span>
              </div>
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-[5px] md:border-[6px] border-transparent border-l-slate-900" />
            </motion.div>
          )}

          {isHovered && !isOpen && !showNotification && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 md:mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] md:text-xs font-black shadow-xl whitespace-nowrap uppercase tracking-widest"
            >
              Liên hệ với cửa hàng
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-slate-900" />
            </motion.div>
          )}
        </AnimatePresence>
 
         {!isOpen && (
           <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
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
