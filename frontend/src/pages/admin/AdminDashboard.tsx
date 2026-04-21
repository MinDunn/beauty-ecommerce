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
  Star,
  AlertCircle,
  type LucideIcon
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { adminService, type DashboardStats } from "../../api/adminService";
import { productService } from "../../api/productService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Legend,
} from "recharts";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

const StatCard = ({ title, value, change, icon: Icon, trend, onClick, subtitle }: StatCardProps & { onClick?: () => void; subtitle?: string }) => (
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
      <div className={`flex items-center gap-1 text-[10px] font-black ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}%
      </div>
    </div>
    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-3xl font-black text-white">{value}</h3>
      {subtitle && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{subtitle}</span>}
    </div>
  </motion.div>
);

export const AdminDashboard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [showOrdersMenu, setShowOrdersMenu] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
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

  const fetchInventoryStats = async () => {
    try {
      // Get products to find low stock
      const pResp = await productService.searchProducts({ size: 100, includeHidden: true });
      const allProducts = pResp.content || [];
      
      const lowStock = allProducts.filter((p: any) => p.stockQuantity < 10 && p.stockQuantity > 0).length;
      setLowStockCount(lowStock);

      // Filter products expiring in next 6 months
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      const expiring = allProducts.filter((p: any) => {
        if (!p.expiryDate) return false;
        const expiry = new Date(p.expiryDate);
        return expiry <= sixMonthsFromNow && expiry > new Date();
      }).length;
      setExpiringSoonCount(expiring);

      // Get recent receipts
      const receipts = await adminService.getInventoryReceipts();
      setRecentReceipts(receipts.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch inventory stats for dashboard", error);
    }
  };

  useEffect(() => {
    fetchStats(days);
    fetchInventoryStats();
  }, [days]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await adminService.exportReport();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `glowzy-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
        <StatCard 
          title="Tồn kho thấp" 
          value={lowStockCount.toString()} 
          change="0" 
          icon={ShoppingBag} 
          trend="down" 
          onClick={() => navigate('/admin/products')}
          subtitle="Sản phẩm"
        />
      </div>

      {/* Alert Banner / Insights */}
      {(lowStockCount > 0 || expiringSoonCount > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500">
                <AlertCircle size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Cảnh báo tồn kho & hạn dùng</p>
                <p className="text-sm font-bold text-slate-300">
                  {lowStockCount > 0 && `Có ${lowStockCount} sản phẩm sắp hết hàng.`} 
                  {expiringSoonCount > 0 && ` Có ${expiringSoonCount} sản phẩm sắp hết hạn trong 6 tháng tới.`}
                </p>
             </div>
          </div>
          <button 
            onClick={() => navigate('/admin/inventory/receipts')}
            className="px-4 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-600 transition-all"
          >
            Xử lý ngay
          </button>
        </motion.div>
      )}

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
          
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.revenueHistory}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f172a', 
                    border: '1px solid #1e293b', 
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                  }}
                  itemStyle={{ color: '#F97316', fontWeight: 900, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: 800, marginBottom: 4 }}
                  formatter={(value: any) => [`${(Number(value) / 1000).toFixed(0)}K VNĐ`, 'Doanh thu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F97316" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
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
              stats?.recentOrders.map((order, i: number) => (
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
                         order.status === 'DELIVERED' ? 'bg-emerald-500' : 
                         order.status === 'CANCELLED' ? 'bg-rose-500' :
                         order.status === 'CANCELLATION_REQUESTED' ? 'bg-pink-500 animate-pulse' :
                         order.status === 'CONFIRMED' ? 'bg-indigo-500' : 'bg-amber-500'
                       }`}></div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                         order.status === 'DELIVERED' ? 'text-emerald-500' : 
                         order.status === 'CANCELLED' ? 'text-rose-500' :
                         order.status === 'CANCELLATION_REQUESTED' ? 'text-pink-500' :
                         order.status === 'CONFIRMED' ? 'text-indigo-500' : 'text-amber-500'
                       }`}>
                         {order.status === 'DELIVERED' ? 'Hoàn thành' : 
                          order.status === 'PENDING' ? 'Chờ duyệt' :
                          order.status === 'SHIPPING' ? 'Đang giao' : 
                          order.status === 'CONFIRMED' ? 'Đang chuẩn bị' :
                          order.status === 'CANCELLATION_REQUESTED' ? 'Yêu cầu hủy' : 'Hủy'}
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

      {/* Product Trends Section — Horizontal Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Potential Conversion / Stimuli Needed Products Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[1.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">SP Cần Kích Cầu</h3>
                <p className="text-[10px] text-slate-500 font-medium">Lượt yêu thích cao nhưng ít người mua</p>
              </div>
            </div>
            <span className="text-[9px] text-orange-400 font-black uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">TIỀM NĂNG</span>
          </div>

          {(!stats?.topFavoritedProducts || stats.topFavoritedProducts.length === 0) ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-xs italic">Chưa có dữ liệu tiềm năng</div>
          ) : (
            <ResponsiveContainer width="100%" height={stats.topFavoritedProducts.length * 52}>
              <BarChart
                data={stats.topFavoritedProducts.map((p) => ({ 
                  name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name, 
                  count: p.count, 
                  sales: p.salesCount,
                  fullName: p.name 
                }))}
                layout="vertical"
                margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 800, fontSize: 12, marginBottom: 4 }}
                  itemStyle={{ padding: '2px 0' }}
                  labelFormatter={(_: any, payload: any) => payload?.[0]?.payload?.fullName || ''}
                />
                <Bar 
                  dataKey="count" 
                  name="Lượt yêu thích" 
                  fill="#f97316" 
                  radius={[0, 4, 4, 0]} 
                  maxBarSize={12} 
                />
                <Bar 
                  dataKey="sales" 
                  name="Đã bán" 
                  fill="#475569" 
                  radius={[0, 4, 4, 0]} 
                  maxBarSize={12} 
                />
                {/* Visual gap indicator could be added here, but simple comparison is clear enough */}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Rated Products Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[1.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Star size={16} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Top Đánh Giá</h3>
                <p className="text-[10px] text-slate-500 font-medium">Lượt đánh giá 5 sao / 7 ngày</p>
              </div>
            </div>
            <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">5 SAO</span>
          </div>

          {(!stats?.topRatedProducts || stats.topRatedProducts.length === 0) ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-xs italic">Chưa có đánh giá 5 sao nào</div>
          ) : (
            <div className="h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.topRatedProducts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="count"
                    animationDuration={1500}
                  >
                    {stats.topRatedProducts.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={['#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E'][index % 5]} 
                        className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontWeight: 800, fontSize: 11 }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(_value, entry: any) => (
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        {entry.payload.name.length > 12 ? entry.payload.name.slice(0, 12) + '…' : entry.payload.name}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">
                  {stats.topRatedProducts.reduce((acc, curr) => acc + curr.count, 0)}
                </span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Tổng 5★</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Inventory Receipts (New Widget) */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Lô hàng mới nhập</h3>
              <button 
                onClick={() => navigate('/admin/inventory/receipts')}
                className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline"
              >
                Tất cả
              </button>
           </div>
           
           <div className="space-y-6">
              {recentReceipts.length === 0 ? (
                <div className="text-center py-10 opacity-50">Chưa có dữ liệu nhập hàng</div>
              ) : (
                recentReceipts.map((receipt, idx) => (
                  <div key={idx} className="flex items-center gap-4 transition-all hover:translate-x-2">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-500 font-black text-[10px]">
                        IN
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">{receipt.productName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SL: {receipt.quantity} • HSD: {receipt.expiryDate || 'N/A'}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-black text-emerald-500">+{receipt.quantity}</p>
                        <p className="text-[9px] text-slate-500 font-medium italic">{new Date(receipt.receivedAt).toLocaleDateString()}</p>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
