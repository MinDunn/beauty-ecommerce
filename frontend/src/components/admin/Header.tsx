import { useState } from "react";
import { LogOut, Bell, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Header = ({ logout }: { logout: () => void }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifications = [
    { id: 1, title: "Đơn hàng mới #GLW88921", time: "2 phút trước", read: false },
    { id: 2, title: "Phản hồi mới từ khách hàng", time: "1 giờ trước", read: true },
    { id: 3, title: "Sản phẩm 'Kem chống nắng' sắp hết hàng", time: "3 giờ trước", read: false },
  ];

  return (
    <header className="h-20 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm đơn hàng, khách hàng..." 
            className="bg-slate-800/50 border border-slate-700 text-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-[#0f172a]"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
              >
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Thông báo</h3>
                  <button onClick={() => setShowNotifications(false)}><X size={14} className="text-slate-500" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-xs font-bold ${n.read ? "text-slate-400" : "text-white"}`}>{n.title}</p>
                        {!n.read && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center bg-slate-800/30">
                  <button className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-400">Xem tất cả</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-px bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-white uppercase tracking-tight">Glowzy Admin</span>
            <span className="text-[10px] text-primary-500 font-black uppercase tracking-widest">Quản trị viên</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 font-bold shadow-inner">
            GA
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-500 px-4 py-2 rounded-xl transition-all duration-200 border border-slate-700 hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};