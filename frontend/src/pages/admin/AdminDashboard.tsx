import { useState, useEffect } from "react";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  CheckCircle,
  type LucideIcon
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

const StatCard = ({ title, value, change, icon: Icon, trend }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900 border border-slate-800 p-6 rounded-3xl group hover:border-primary-500/50 transition-all duration-300 shadow-xl"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-2xl bg-slate-800 group-hover:bg-primary-500/10 transition-colors">
        <Icon className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}
      </div>
    </div>
    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-white">{value}</h3>
  </motion.div>
);

export const AdminDashboard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [counts, setCounts] = useState({ revenue: 128.5, orders: 1240, customers: 856 });

  // Simulate data fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        revenue: +(prev.revenue + (Math.random() * 0.5 - 0.2)).toFixed(1),
        orders: prev.orders + (Math.random() > 0.7 ? 1 : 0),
        customers: prev.customers + (Math.random() > 0.9 ? 1 : 0),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase underline decoration-primary-500 decoration-4 underline-offset-8">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-4 italic">Báo cáo tình hình kinh doanh thời gian thực hôm nay từ <span className="text-white font-black">Glowzy</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700">7 Ngày qua</button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span>{isExporting ? "Đang xử lý..." : "Xuất báo cáo"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showExportSuccess && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-24 right-8 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 font-bold"
          >
            <CheckCircle size={24} />
            <span>Báo cáo đã được xuất thành công!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng doanh thu" value={`${counts.revenue}M`} change="+12.5%" icon={DollarSign} trend="up" />
        <StatCard title="Đơn hàng" value={counts.orders.toLocaleString()} change="+8.2%" icon={ShoppingBag} trend="up" />
        <StatCard title="Khách hàng" value={counts.customers.toLocaleString()} change="-2.4%" icon={Users} trend="down" />
        <StatCard title="Phản hồi" value="48" change="+14.1%" icon={MessageSquare} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - SVG Mockup */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Tổng quan doanh thu</h3>
              <p className="text-sm text-slate-500 font-medium italic">Xu hướng 7 ngày gần nhất</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
              <TrendingUp className="w-4 h-4" />
              +15.3%
            </div>
          </div>
          
          <div className="h-64 relative flex items-end gap-2 md:gap-4 px-2 font-sans">
             {/* Simple visual bar chart using heights */}
             {[45, 65, 35, 85, 55, 75, 95].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-primary-500 px-2 py-1 rounded-lg text-[10px] font-black pointer-events-none mb-1 shadow-lg border border-primary-500/20 whitespace-nowrap">
                   {(h * 1.5).toFixed(0)}tr
                 </div>
                 <div 
                   className="w-full bg-slate-800 rounded-xl group-hover:bg-primary-500 transition-all duration-500 relative shadow-inner overflow-hidden" 
                   style={{ height: `${h}%` }}
                 >
                   <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: "100%" }}
                     transition={{ delay: i * 0.1, duration: 0.8 }}
                     className="absolute bottom-0 left-0 right-0 bg-primary-500/10"
                   />
                 </div>
                 <span className="text-[10px] font-black text-slate-600 group-hover:text-primary-500 transition-colors uppercase tracking-widest">T{i+2}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Recent Orders Side Table */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Đơn hàng mới</h3>
            <button className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-xl"><MoreHorizontal size={20} /></button>
          </div>
          <div className="space-y-6 flex-1">
            {[
              { id: '#GLW8821', name: 'Nguyễn Văn A', amount: '2,500K', status: 'Chờ duyệt' },
              { id: '#GLW8820', name: 'Trần Thị B', amount: '1,200K', status: 'Đã thanh toán' },
              { id: '#GLW8819', name: 'Lê Văn C', amount: '850K', status: 'Đang giao' },
              { id: '#GLW8818', name: 'Phạm Minh D', amount: '3,100K', status: 'Hoàn thành' },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-slate-800/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-[10px] text-primary-500 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-600 transition-all shadow-inner">
                    OD
                  </div>
                  <div>
                    <p className="text-sm font-black text-white group-hover:text-primary-500 transition-colors">{order.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{order.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white tracking-tight">{order.amount}</p>
                  <div className={`mt-1 flex items-center justify-end gap-1.5`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${
                       order.status === 'Hoàn thành' ? 'bg-emerald-500' : 'bg-amber-500'
                     }`}></div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${
                       order.status === 'Hoàn thành' ? 'text-emerald-500' : 'text-amber-500'
                     }`}>{order.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 rounded-2xl bg-slate-800/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-500 hover:text-white transition-all shadow-inner">
            Xem tất cả đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};
