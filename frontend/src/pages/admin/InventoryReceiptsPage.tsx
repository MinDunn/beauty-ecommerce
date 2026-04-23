import { useMemo, useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { adminService } from '../../api/adminService';
import type { InventoryReceipt } from '../../types';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FileText, Calendar, DollarSign, Package, Clock, Search, ChevronRight } from 'lucide-react';
import { InvoicePreviewModal } from '../../components/admin/InvoicePreviewModal';
import { cn } from '../../utils/cn';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const InventoryReceiptsPage = () => {
  const [receipts, setReceipts] = useState<InventoryReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days'>('all');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const fetchReceipts = async () => {
    try {
      const data = await adminService.getInventoryReceipts();
      setReceipts(data);
    } catch (error) {
      toast.error('Không thể tải danh sách hóa đơn nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();

    const handleGlobalReload = () => {
      fetchReceipts();
    };
    window.addEventListener('admin-reload-data', handleGlobalReload);
    return () => window.removeEventListener('admin-reload-data', handleGlobalReload);
  }, []);

  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const groupedReceipts = useMemo(() => {
    const groups: { [key: string]: InventoryReceipt[] } = {};
    receipts.forEach(r => {
      const time = r.receivedAt;
      if (!groups[time]) groups[time] = [];
      groups[time].push(r);
    });

    return Object.entries(groups).map(([time, items]) => ({
      receivedAt: time,
      items,
      totalAmount: items.reduce((sum, item) => sum + Number(item.costPrice) * Number(item.quantity), 0),
      totalQuantity: items.reduce((sum, item) => sum + Number(item.quantity), 0),
      id: items[0].id
    })).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }, [receipts]);

  const filteredGroups = useMemo(() => {
    return groupedReceipts.filter((group) => {
      const groupDate = new Date(group.receivedAt);
      const dateText = group.receivedAt.slice(0, 10);
      const hour = groupDate.getHours().toString().padStart(2, '0');

      // Date Range Filter
      let rangeMatched = true;
      const now = new Date();
      if (dateRange === 'today') {
        rangeMatched = dateText === format(now, 'yyyy-MM-dd');
      } else if (dateRange === '7days') {
        rangeMatched = isWithinInterval(groupDate, {
          start: startOfDay(subDays(now, 7)),
          end: endOfDay(now)
        });
      }

      // Keyword Filter
      const searchable = normalizeText(
        `${group.id} ${group.items.map(i => i.productName).join(' ')}`
      );
      const keywordMatched = normalizeText(keyword).trim() === '' || searchable.includes(normalizeText(keyword).trim());

      // Custom Select Filters
      const dateMatched = !selectedDate || dateText === selectedDate;
      const hourMatched = !selectedHour || hour === selectedHour;

      return rangeMatched && keywordMatched && dateMatched && hourMatched;
    });
  }, [groupedReceipts, keyword, selectedDate, selectedHour, dateRange]);

  const overallStats = useMemo(() => {
    const now = new Date();
    const today = receipts.filter((receipt) => {
      if (!receipt || !receipt.receivedAt) return false;
      const d = new Date(receipt.receivedAt);
      if (isNaN(d.getTime())) return false;
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
    const month = receipts.filter((receipt) => {
      if (!receipt || !receipt.receivedAt) return false;
      const d = new Date(receipt.receivedAt);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    return {
      todayCount: today.length,
      todayTotal: today.reduce((sum, item) => sum + Number(item.costPrice) * Number(item.quantity), 0),
      monthCount: month.length,
      monthTotal: month.reduce((sum, item) => sum + Number(item.costPrice) * Number(item.quantity), 0)
    };
  }, [receipts]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase underline decoration-primary-500 decoration-4 underline-offset-8">
            Hóa đơn nhập hàng
          </h1>
          <p className="text-slate-500 font-medium mt-4 italic">
            Quản lý và xem lịch sử các đợt nhập hàng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={80} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trong ngày hôm nay</p>
          <p className="text-2xl font-black text-white mt-2">{overallStats.todayCount} mặt hàng</p>
          <p className="text-emerald-500 font-bold mt-1">
            {overallStats.todayTotal.toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar size={80} className="text-primary-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trong tháng này</p>
          <p className="text-2xl font-black text-white mt-2">{overallStats.monthCount} mặt hàng</p>
          <p className="text-primary-500 font-bold mt-1">
            {overallStats.monthTotal.toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Lọc nhanh thời gian</p>
          <div className="grid grid-cols-3 gap-2 flex-1">
            <button
              onClick={() => setDateRange('all')}
              className={cn(
                "rounded-2xl font-bold text-[10px] uppercase transition-all border",
                dateRange === 'all' ? "bg-white text-slate-950 border-white shadow-xl" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              )}
            >
              Tất cả
            </button>
            <button
              onClick={() => setDateRange('today')}
              className={cn(
                "rounded-2xl font-bold text-[10px] uppercase transition-all border",
                dateRange === 'today' ? "bg-emerald-500 text-white border-emerald-400 shadow-xl shadow-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              )}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setDateRange('7days')}
              className={cn(
                "rounded-2xl font-bold text-[10px] uppercase transition-all border",
                dateRange === '7days' ? "bg-primary-500 text-white border-primary-400 shadow-xl shadow-primary-500/20" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              )}
            >
              7 ngày qua
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Lọc theo mã đơn / sản phẩm..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white outline-none focus:border-primary-500"
          />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500"
        />
        <select
          value={selectedHour}
          onChange={(e) => setSelectedHour(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500"
        >
          <option value="">Tất cả giờ</option>
          {Array.from({ length: 24 }).map((_, h) => {
            const value = h.toString().padStart(2, '0');
            return (
              <option key={value} value={value}>
                {value}:00 - {value}:59
              </option>
            );
          })}
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã Đơn Nhập</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung sản phẩm</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">SL Tổng</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Giá Nhập TB</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Tổng Tiền</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 italic">
                    Chưa có đơn nhập hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <motion.tr 
                    key={group.receivedAt}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsPreviewOpen(true);
                    }}
                    className="hover:bg-slate-800/50 transition-all group cursor-pointer border-l-4 border-transparent hover:border-primary-500"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-primary-500/10 transition-colors">
                          <FileText size={16} className="text-slate-400 group-hover:text-primary-500" />
                        </div>
                        <div>
                           <span className="block text-sm font-bold text-white group-hover:text-primary-500 transition-colors">#RC-{group.id}</span>
                           <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Hóa đơn tổng</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <Package size={14} className="text-slate-500" />
                           <span className="text-sm font-semibold text-slate-100">
                             {group.items[0].productName}
                             {group.items.length > 1 && <span className="ml-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">+{group.items.length - 1} khác</span>}
                           </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                           <span>Mã đơn: {group.items.length} mặt hàng</span>
                           <span className="flex items-center gap-1"><User size={10} /> Quản trị viên</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-sm font-black text-primary-500">{group.totalQuantity}</span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {(group.totalAmount / group.totalQuantity).toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Trung bình</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                       <p className="text-sm font-black text-emerald-500">{group.totalAmount.toLocaleString('vi-VN')} đ</p>
                       <p className="text-[9px] text-slate-500 font-bold italic uppercase tracking-tighter">Tổng thanh toán</p>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center justify-end gap-4">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2 text-slate-400 mb-1">
                              <Calendar size={12} />
                              <span className="text-xs font-bold">
                                {new Date(group.receivedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-slate-500">
                              <Clock size={12} />
                              <span className="text-[10px] font-medium">
                                {new Date(group.receivedAt).toLocaleTimeString('vi-VN')}
                              </span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <ChevronRight size={16} className="text-primary-500" />
                          </div>
                       </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        receiptGroup={selectedGroup}
      />
    </div>
  );
};
