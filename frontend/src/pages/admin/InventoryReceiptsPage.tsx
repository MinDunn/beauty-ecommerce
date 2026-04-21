import { useMemo, useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import type { InventoryReceipt } from '../../types';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FileText, Calendar, DollarSign, Package, Clock, Search } from 'lucide-react';

export const InventoryReceiptsPage = () => {
  const [receipts, setReceipts] = useState<InventoryReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');

  useEffect(() => {
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
    fetchReceipts();
  }, []);

  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const receiptDate = receipt.receivedAt ? new Date(receipt.receivedAt) : new Date();
      const receiptDateText = receipt.receivedAt?.slice(0, 10) || '';
      const receiptHour = receiptDate.getHours().toString().padStart(2, '0');
      const searchable = normalizeText(
        `${receipt.id} ${receipt.productId} ${receipt.productName ?? ''}`
      );
      const keywordMatched = normalizeText(keyword).trim() === '' || searchable.includes(normalizeText(keyword).trim());
      const dateMatched = !selectedDate || receiptDateText === selectedDate;
      const hourMatched = !selectedHour || receiptHour === selectedHour;
      return keywordMatched && dateMatched && hourMatched;
    });
  }, [receipts, keyword, selectedDate, selectedHour]);

  const overallStats = useMemo(() => {
    const now = new Date();
    const today = receipts.filter((receipt) => {
      const d = new Date(receipt.receivedAt);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
    const month = receipts.filter((receipt) => {
      const d = new Date(receipt.receivedAt);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trong ngày</p>
          <p className="text-2xl font-black text-white mt-2">{overallStats.todayCount} hóa đơn</p>
          <p className="text-emerald-500 font-bold mt-1">
            Tổng tiền: {overallStats.todayTotal.toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trong tháng</p>
          <p className="text-2xl font-black text-white mt-2">{overallStats.monthCount} hóa đơn</p>
          <p className="text-emerald-500 font-bold mt-1">
            Tổng tiền: {overallStats.monthTotal.toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Lọc theo tên sản phẩm / mã hóa đơn..."
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
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã Hóa đơn</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Số lượng</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Giá nhập</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng tiền</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày nhập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 italic">
                    Chưa có hóa đơn nhập hàng nào.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <motion.tr 
                    key={receipt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-primary-500/10 transition-colors">
                          <FileText size={16} className="text-slate-400 group-hover:text-primary-500" />
                        </div>
                        <span className="text-sm font-bold text-white">#RC-{receipt.id}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-500" />
                        <div>
                          <span className="block text-sm font-semibold text-slate-100">{receipt.productName ?? 'Sản phẩm không xác định'}</span>
                          <span className="block text-xs font-medium text-slate-400">ID: {receipt.productId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-black text-primary-500">{receipt.quantity}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-emerald-500" />
                        <span className="text-sm font-bold text-white">
                          {receipt.costPrice.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-black text-emerald-500">
                      {(Number(receipt.costPrice) * Number(receipt.quantity)).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">
                          {new Date(receipt.receivedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={14} />
                        <span className="text-xs font-medium">
                          {new Date(receipt.receivedAt).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
