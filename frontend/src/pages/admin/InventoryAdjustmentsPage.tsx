import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../api/productService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calendar, Package, Clock, Search, Check, X as XIcon, AlertCircle, Eye, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import { adminService } from '../../api/adminService';

interface InventoryAdjustment {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  reason: string;
  compensationAmount: number;
  estimatedLossAmount: number;
  variantName?: string;
  remarks?: string;
  adjustedAt: string;
  status: string; // PENDING, APPROVED, REJECTED, COMPLETED
}

export const InventoryAdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchAdjustments = async () => {
    try {
      const data = await productService.adminGetInventoryAdjustments();
      // Sắp xếp PENDING lên đầu để dễ thấy
      const sorted = [...data].sort((a: any, b: any) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.adjustedAt).getTime() - new Date(a.adjustedAt).getTime();
      });
      setAdjustments(sorted);
    } catch (error) {
      toast.error('Không thể tải danh sách điều chỉnh kho');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await adminService.approveAdjustment(id);
      toast.success('Đã phê duyệt điều chỉnh kho');
      fetchAdjustments();
      // Phát sự kiện để cập nhật lại Dashboard nếu cần
      window.dispatchEvent(new CustomEvent('admin-reload-data'));
    } catch (error) {
      toast.error('Lỗi khi phê duyệt');
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn từ chối điều chỉnh này?')) return;
    try {
      await adminService.rejectAdjustment(id);
      toast.success('Đã từ chối điều chỉnh');
      fetchAdjustments();
      window.dispatchEvent(new CustomEvent('admin-reload-data'));
    } catch (error) {
      toast.error('Lỗi khi từ chối');
    }
  };

  useEffect(() => {
    fetchAdjustments();

    const handleGlobalReload = () => {
      fetchAdjustments();
    };
    window.addEventListener('admin-reload-data', handleGlobalReload);
    return () => window.removeEventListener('admin-reload-data', handleGlobalReload);
  }, []);

  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((adj) => {
      const adjDateText = adj.adjustedAt?.slice(0, 10) || '';
      const searchable = normalizeText(
        `${adj.id} ${adj.productId} ${adj.productName ?? ''} ${adj.reason}`
      );
      const keywordMatched = normalizeText(keyword).trim() === '' || searchable.includes(normalizeText(keyword).trim());
      const dateMatched = !selectedDate || adjDateText === selectedDate;
      return keywordMatched && dateMatched;
    });
  }, [adjustments, keyword, selectedDate]);

  const stats = useMemo(() => {
    // Chỉ tính toán số liệu thực tế dựa trên các bản ghi đã được PHÊ DUYỆT hoặc HOÀN TẤT
    const activeAdjustments = adjustments.filter(adj => 
      adj.status === 'APPROVED' || adj.status === 'COMPLETED' || adj.status === undefined
    );

    const totalLostUnits = activeAdjustments.reduce((sum, adj) => adj.quantity < 0 ? sum + Math.abs(adj.quantity) : sum, 0);
    const totalSurplusUnits = activeAdjustments.reduce((sum, adj) => adj.quantity > 0 ? sum + adj.quantity : sum, 0);

    // estimatedLossAmount > 0 is Real Loss, < 0 is Surplus
    const totalValueLoss = activeAdjustments.reduce((sum, adj) => adj.estimatedLossAmount > 0 ? sum + adj.estimatedLossAmount : sum, 0);
    const totalValueSurplus = activeAdjustments.reduce((sum, adj) => adj.estimatedLossAmount < 0 ? sum + Math.abs(adj.estimatedLossAmount) : sum, 0);

    const totalCompensation = activeAdjustments.reduce((sum, adj) => sum + (adj.compensationAmount || 0), 0);

    // Final balance: (Loss - Surplus - Compensation)
    const netBalance = totalValueLoss - totalValueSurplus - totalCompensation;

    return { totalLostUnits, totalSurplusUnits, totalValueLoss, totalValueSurplus, totalCompensation, netBalance };
  }, [adjustments]);

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
        <div className="flex items-start gap-6">
          <Link 
            to="/admin/products"
            className="mt-1 p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-2xl transition-all shadow-xl group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase underline decoration-amber-500 decoration-4 underline-offset-8">
              Nhật ký điều chỉnh kho
            </h1>
            <p className="text-slate-500 font-medium mt-4 italic">
              Theo dõi lý do hao hụt sản phẩm và số tiền đền bù (nếu có).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hao hụt / Thặng dư</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500">-{stats.totalLostUnits}</span>
            <span className="text-slate-600">/</span>
            <span className="text-xl font-black text-emerald-500">+{stats.totalSurplusUnits}</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tổng thiệt hại (vốn)</p>
          <p className="text-2xl font-black text-rose-500">{stats.totalValueLoss.toLocaleString('vi-VN')} đ</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Thặng dư / Đền bù</p>
          <p className="text-2xl font-black text-emerald-500">{(stats.totalValueSurplus + stats.totalCompensation).toLocaleString('vi-VN')} đ</p>
        </div>
        <div className={cn(
          "bg-slate-900 border-2 rounded-3xl p-6 flex flex-col justify-center gap-2 shadow-xl",
          stats.netBalance > 0 ? "border-rose-500/20" : "border-emerald-500/20"
        )}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {stats.netBalance > 0 ? "Mất mát thực tế" : "Thặng dư thực tế"}
          </p>
          <p className={cn(
            "text-2xl font-black",
            stats.netBalance > 0 ? "text-rose-500" : "text-emerald-500"
          )}>
            {Math.abs(stats.netBalance).toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo sản phẩm, lý do..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
          />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">SL</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Lý do</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thiệt hại</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Đền bù</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái / Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 italic">
                    Chưa có nhật ký điều chỉnh nào.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => (
                  <motion.tr
                    key={adj.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "hover:bg-slate-800/30 transition-colors group",
                      adj.status === 'REJECTED' && "opacity-50"
                    )}
                  >
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar size={12} className="text-slate-500" />
                          <span className="text-xs font-bold">{new Date(adj.adjustedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={12} />
                          <span className="text-[10px]">{new Date(adj.adjustedAt).toLocaleTimeString('vi-VN')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-500">
                           <Package size={14} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                             <span className="block text-sm font-bold text-slate-100">{adj.productName ?? 'Sản phẩm không xác định'}</span>
                             <Link 
                               to={`/product/${adj.productId}`}
                               target="_blank"
                               className="p-1 text-primary-500 hover:bg-primary-500/10 rounded-md transition-all"
                               title="Xem trang sản phẩm"
                             >
                               <Eye size={12} />
                             </Link>
                          </div>
                          {adj.variantName && <span className="block text-[10px] font-medium text-slate-400 italic">Phân loại: {adj.variantName}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={cn(
                        "text-sm font-black px-2 py-0.5 rounded-lg",
                        adj.quantity < 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
                      </span>
                    </td>
                    <td className="p-6 italic text-sm text-slate-400 max-w-[200px]" title={adj.reason}>
                      <div className="flex flex-col gap-1">
                        <span className="truncate" title={adj.reason}>{adj.reason}</span>
                        {adj.remarks && (
                          <span className="text-[10px] text-slate-500 font-medium not-italic leading-relaxed bg-slate-800/50 p-2 rounded-lg mt-1 border border-slate-700/50">
                            Ghi chú: {adj.remarks}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={cn(
                      "p-6 text-sm font-black text-right",
                      adj.estimatedLossAmount < 0 ? "text-emerald-500" : (adj.estimatedLossAmount > 0 ? "text-rose-500" : "text-slate-500")
                    )}>
                      {adj.estimatedLossAmount !== 0 ? (
                        <div className="flex flex-col">
                          <span>{adj.estimatedLossAmount < 0 ? '+' : ''}{Math.abs(adj.estimatedLossAmount).toLocaleString('vi-VN')} đ</span>
                          <span className="text-[9px] uppercase tracking-tighter opacity-70">
                            {adj.estimatedLossAmount < 0 ? 'Hồi lại (Thặng dư)' : 'Thiệt hại (Vốn)'}
                          </span>
                        </div>
                      ) : (adj.quantity !== 0 ? '0 đ' : '---')}
                    </td>
                    <td className="p-6 text-sm font-black text-emerald-500 text-right">
                      {adj.compensationAmount > 0 ? `${adj.compensationAmount.toLocaleString('vi-VN')} đ` : '---'}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col items-center gap-2">
                        {adj.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(adj.id)}
                              className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                              title="Phê duyệt"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(adj.id)}
                              className="p-2 bg-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                              title="Từ chối"
                            >
                              <XIcon size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
                            adj.status === 'APPROVED' || adj.status === 'COMPLETED' 
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                          )}>
                            {adj.status === 'APPROVED' || adj.status === 'COMPLETED' ? 'Đã duyệt' : 'Đã từ chối'}
                          </span>
                        )}
                        {adj.status === 'PENDING' && (
                          <span className="flex items-center gap-1 text-[9px] text-amber-500 font-bold animate-pulse">
                            <AlertCircle size={10} /> Chờ duyệt
                          </span>
                        )}
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
