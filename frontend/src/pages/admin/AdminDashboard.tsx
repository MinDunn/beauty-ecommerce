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
  ChevronDown,
  RefreshCcw,
  Eye,
  type LucideIcon
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { adminService } from "../../api/adminService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

const StatCard = ({ title, value, change, icon: Icon, trend, onClick }: StatCardProps & { onClick?: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`bg-slate-900 border border-slate-800 p-6 rounded-3xl group transition-all duration-300 shadow-xl ${onClick ? 'cursor-pointer hover:border-primary-500/50' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-2xl bg-slate-800 group-hover:bg-primary-500/10 transition-colors">
        <Icon className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}%
      </div>
    </div>
    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-white">{value}</h3>
  </motion.div>
);

export const AdminDashboard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [showOrdersMenu, setShowOrdersMenu] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async (rangeDays: number) => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardStats(rangeDays);
      setStats(response);
    } catch (error) {
      toast.error("Không thể tải thông tin thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(days);
  }, [days]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await adminService.exportReport();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `glowzy-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3000);
    } catch (error) {
      toast.error("Lỗi khi xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase underline decoration-primary-500 decoration-4 underline-offset-8">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-4 italic">Báo cáo tình hình kinh doanh từ <span className="text-white font-black">Glowzy</span>.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowDaysDropdown(!showDaysDropdown)}
              className="bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2"
            >
              <span>{days === 7 ? '7 Ngày qua' : days === 30 ? '30 Ngày qua' : '90 Ngày qua'}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showDaysDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showDaysDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                >
                  {[7, 30, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDays(d);
                        setShowDaysDropdown(false);
                      }}
                      className={`w-full text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-slate-800 ${days === d ? 'text-primary-500 bg-primary-500/5' : 'text-slate-400'}`}
                    >
                      {d} Ngày qua
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={16} />}
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
        <StatCard 
          title="Tổng doanh thu" 
          value={`${((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M`} 
          change={Math.abs(stats?.revenueGrowth || 0).toFixed(1)} 
          icon={DollarSign} 
          trend={(stats?.revenueGrowth || 0) >= 0 ? 'up' : 'down'} 
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard 
          title="Đơn hàng" 
          value={stats?.totalOrders?.toString() || "0"} 
          change={Math.abs(stats?.orderGrowth || 0).toFixed(1)} 
          icon={ShoppingBag} 
          trend={(stats?.orderGrowth || 0) >= 0 ? 'up' : 'down'} 
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard 
          title="Khách hàng" 
          value={stats?.totalCustomers?.toString() || "0"} 
          change={Math.abs(stats?.customerGrowth || 0).toFixed(1)} 
          icon={Users} 
          trend={(stats?.customerGrowth || 0) >= 0 ? 'up' : 'down'} 
          onClick={() => navigate('/admin/users')}
        />
        <StatCard 
          title="Phản hồi" 
          value={stats?.totalFeedback?.toString() || "0"} 
          change={Math.abs(stats?.feedbackGrowth || 0).toFixed(1)} 
          icon={MessageSquare} 
          trend={(stats?.feedbackGrowth || 0) >= 0 ? 'up' : 'down'} 
          onClick={() => navigate('/admin/feedback')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Tổng quan doanh thu</h3>
              <p className="text-sm text-slate-500 font-medium italic">Xu hướng {days} ngày gần nhất</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
              (stats?.revenueGrowth || 0) >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
            }`}>
              {(stats?.revenueGrowth || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(stats?.revenueGrowth || 0).toFixed(1)}%
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between px-2 gap-2 md:gap-4">
              {stats?.revenueHistory.map((item: any, i: number) => {
                const revenueValues = stats?.revenueHistory.map((r: any) => Number(r.revenue) || 0);
                const maxRevenue = Math.max(...revenueValues, 1);
                const currentRevenue = Number(item.revenue) || 0;
                const barHeight = (currentRevenue / maxRevenue) * 100;
                
                return (
                 <div key={i} className="flex-1 h-full flex flex-col justify-end group">
                   <div className="relative w-full flex flex-col items-center">
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-primary-500 px-2 py-1 rounded-lg text-[10px] font-black pointer-events-none shadow-xl border border-primary-500/20 whitespace-nowrap z-10">
                        {(currentRevenue / 1000).toFixed(0)}K
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-xl relative overflow-hidden border border-slate-700/50" style={{ height: '140px' }}>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(barHeight, 5)}%` }}
                          transition={{ delay: i * 0.05, duration: 1 }}
                          className="absolute bottom-0 left-0 right-0 bg-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.4)] rounded-t-lg"
                        />
                      </div>
                      <span className={`mt-4 text-[10px] font-black transition-colors uppercase tracking-[0.1em] ${currentRevenue > 0 ? 'text-[#F97316]' : 'text-slate-500'}`}>
                        {item.date}
                      </span>
                   </div>
                 </div>
                );
              })}
          </div>
        </div>

        {/* Recent Orders Side Table */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-8 relative">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Đơn hàng mới</h3>
            <div className="relative">
              <button 
                onClick={() => setShowOrdersMenu(!showOrdersMenu)}
                className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-xl"
              >
                <MoreHorizontal size={20} />
              </button>
              
              <AnimatePresence>
                {showOrdersMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        fetchStats(days);
                        setShowOrdersMenu(false);
                        toast.success("Đã làm mới dữ liệu");
                      }}
                      className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <RefreshCcw size={14} />
                      Làm mới
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/admin/orders');
                        setShowOrdersMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <Eye size={14} />
                      Xem chi tiết
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="space-y-6 flex-1">
            {stats?.recentOrders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-500 text-sm italic font-medium">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              stats?.recentOrders.map((order: any, i: number) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-slate-800/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-[10px] text-primary-500 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-600 transition-all shadow-inner">
                      OD
                    </div>
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-primary-500 transition-colors">{order.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">#{order.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white tracking-tight">{(order.amount / 1000).toFixed(0)}K</p>
                    <div className={`mt-1 flex items-center justify-end gap-1.5`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${
                         order.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-amber-500'
                       }`}></div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                         order.status === 'DELIVERED' ? 'text-emerald-500' : 'text-amber-500'
                       }`}>
                         {order.status === 'DELIVERED' ? 'Hoàn thành' : 
                          order.status === 'PENDING' ? 'Chờ duyệt' :
                          order.status === 'SHIPPING' ? 'Đang giao' : 'Hủy'}
                       </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="w-full mt-10 py-4 rounded-2xl bg-slate-800/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#F97316] hover:text-white transition-all shadow-inner"
          >
            Xem tất cả đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};
