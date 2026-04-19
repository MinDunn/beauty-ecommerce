import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Ticket,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import couponService from '../../api/couponService';
import type { CouponData } from '../../api/couponService';
import categoryService from '../../api/categoryService';

export const Coupons = () => {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null);
  const [formData, setFormData] = useState<CouponData>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: 0,
    usageLimit: 100,
    isActive: true,
    categoryId: undefined,
    maxDiscountAmount: undefined,
    minQuantity: 0,
    isNewUserOnly: false,
    minSpentAmount: 0,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirm state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories for coupon restricted selection');
    }
  };

  const handleOpenModal = (coupon?: CouponData) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        ...coupon,
        expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
        minSpentAmount: coupon.minSpentAmount || 0,
        minQuantity: coupon.minQuantity || 0,
        isNewUserOnly: coupon.isNewUserOnly || false,
        description: coupon.description || ''
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minOrderAmount: 0,
        usageLimit: 100,
        isActive: true,
        categoryId: undefined,
        maxDiscountAmount: undefined,
        minQuantity: 0,
        isNewUserOnly: false,
        minSpentAmount: 0,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    setIsSubmitting(true);
    try {
      // Format expiry date to LocalDateTime-like string if present
      const submissionData = {
        ...formData,
        code: formData.code.toUpperCase(),
        expiryDate: formData.expiryDate ? `${formData.expiryDate}T23:59:59` : undefined
      };

      if (editingCoupon?.id) {
        await couponService.updateCoupon(editingCoupon.id, submissionData);
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await couponService.createCoupon(submissionData);
        toast.success('Tạo mã giảm giá mới thành công');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await couponService.deleteCoupon(deleteId);
      toast.success('Đã xóa mã giảm giá');
      setDeleteId(null);
      fetchCoupons();
    } catch (error) {
      toast.error('Không thể xóa mã giảm giá này');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase underline decoration-primary-500 decoration-4 underline-offset-8">Mã giảm giá</h1>
          <p className="text-slate-500 font-medium mt-4 italic">Quản lý các chương trình khuyến mãi và mã ưu đãi.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Tạo mã mới</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Tìm mã giảm giá (VD: GLOWZY20)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all text-sm"
          />
        </div>
        <div className="bg-slate-900 px-6 py-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Ticket className="text-primary-500" size={18} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang chạy:</span>
          <span className="text-white font-black">{coupons.filter(c => c.isActive).length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã & Mô tả</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giảm giá</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Điều kiện</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lượt dùng</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Ticket className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Chưa có mã giảm giá nào</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={coupon.id} 
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white group-hover:text-primary-500 transition-colors">{coupon.code}</span>
                        <span className="text-[9px] text-slate-500 font-medium italic line-clamp-1 mt-1">{coupon.description || 'Không có mô tả'}</span>
                        {coupon.categoryId && (
                          <span className="text-[8px] font-black text-primary-500/80 uppercase tracking-tighter mt-1 flex items-center gap-1">
                            <Tag size={8} /> 
                            {categories.find(c => c.id === coupon.categoryId)?.name || 'Theo danh mục'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-300">
                          {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `${coupon.discountValue?.toLocaleString()}đ`}
                        </span>
                        {coupon.maxDiscountAmount && coupon.discountType === 'PERCENTAGE' && (
                          <span className="text-[8px] text-slate-500 font-bold uppercase mt-1 italic">Tối đa {coupon.maxDiscountAmount.toLocaleString()}đ</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          {coupon.minOrderAmount ? (
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">🛒 ≥ {coupon.minOrderAmount.toLocaleString()}đ</div>
                          ) : null}
                          {coupon.minQuantity ? (
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">📦 ≥ {coupon.minQuantity} món</div>
                          ) : null}
                          {coupon.isNewUserOnly ? (
                            <div className="text-[9px] text-primary-400 font-black uppercase tracking-tighter">✨ Chỉ khách mới</div>
                          ) : null}
                          {coupon.minSpentAmount ? (
                            <div className="text-[9px] text-amber-500/80 font-black uppercase tracking-tighter">💎 Tích lũy ≥ {coupon.minSpentAmount.toLocaleString()}đ</div>
                          ) : null}
                          {!coupon.minOrderAmount && !coupon.minQuantity && !coupon.isNewUserOnly && !coupon.minSpentAmount && (
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">Không điều kiện</span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col justify-center">
                        <div className="flex justify-between w-24 mb-1">
                          <span className="text-[9px] font-black text-slate-500">{coupon.usageCount}/{coupon.usageLimit}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-primary-500" 
                            style={{ width: `${Math.min(((coupon.usageCount || 0) / (coupon.usageLimit || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                        coupon.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
                        {coupon.isActive ? 'Đang chạy' : 'Đã dừng'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(coupon)}
                          className="p-2.5 bg-slate-800 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(coupon.id || null)}
                          className="p-2.5 bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
                    <Ticket size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase">{editingCoupon ? 'Cập nhật mã giảm giá' : 'Tạo mã mới'}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Glowzy Promotion Hub</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mã giảm giá</label>
                    <input 
                      type="text" 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all uppercase"
                      placeholder="VD: GLOWZYSUMMER"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Áp dụng cho</label>
                    <select 
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value ? Number(e.target.value) : undefined})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all appearance-none"
                    >
                      <option value="">Toàn sàn (Tất cả sản phẩm)</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mô tả điều kiện</label>
                    <textarea 
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all resize-none"
                      placeholder="VD: Giảm 20% cho đơn từ 200k, tối đa 50k..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Loại giảm giá</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, discountType: 'PERCENTAGE'})}
                        className={`flex-1 py-3 rounded-xl border font-black text-[10px] uppercase transition-all ${
                          formData.discountType === 'PERCENTAGE' ? 'bg-primary-500 border-primary-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Phần trăm (%)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, discountType: 'FIXED'})}
                        className={`flex-1 py-3 rounded-xl border font-black text-[10px] uppercase transition-all ${
                          formData.discountType === 'FIXED' ? 'bg-primary-500 border-primary-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        Cố định (đ)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giá trị giảm</label>
                    <input 
                      type="number" 
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all"
                    />
                  </div>

                  {formData.discountType === 'PERCENTAGE' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mức giảm tối đa (đ)</label>
                      <input 
                        type="number" 
                        value={formData.maxDiscountAmount || ''}
                        onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined})}
                        className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all border-dashed border-primary-500/30"
                        placeholder="Để trống nếu không giới hạn"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px) font-black text-slate-500 uppercase tracking-widest ml-1">Đơn hàng tối thiểu (đ)</label>
                    <input 
                      type="number" 
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số lượng SP tối thiểu</label>
                    <input 
                      type="number" 
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({...formData, minQuantity: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chi tiêu tích lũy tối thiểu (đ)</label>
                    <input 
                      type="number" 
                      value={formData.minSpentAmount}
                      onChange={(e) => setFormData({...formData, minSpentAmount: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all"
                      placeholder="VD: 1,000,000..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ngày hết hạn</label>
                    <input 
                      type="date" 
                      value={formData.expiryDate || ''}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giới hạn sử dụng (Tổng)</label>
                    <input 
                      type="number" 
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chỉ khách mới</label>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isNewUserOnly: !formData.isNewUserOnly})}
                          className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border font-bold text-xs transition-all ${
                            formData.isNewUserOnly ? 'bg-primary-500/10 border-primary-500/50 text-primary-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <span>{formData.isNewUserOnly ? 'Bật' : 'Tắt'}</span>
                          <CheckCircle size={16} className={formData.isNewUserOnly ? 'opacity-100' : 'opacity-20'} />
                        </button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kích hoạt</label>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                          className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border font-bold text-xs transition-all ${
                            formData.isActive ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <span>{formData.isActive ? 'Đang chạy' : 'Sẵn sàng'}</span>
                          {formData.isActive ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-4 pt-6 border-t border-slate-800 mt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-slate-800 text-slate-400 font-black rounded-2xl hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] py-4 bg-primary-500 text-white font-black rounded-2xl hover:bg-primary-600 shadow-xl shadow-primary-500/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <div className="flex items-center gap-2">
                           <Tag size={18} />
                           <span>{editingCoupon ? 'Cập nhật Voucher' : 'Phát hành Voucher'}</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-sm bg-slate-900 border border-slate-800 p-8 rounded-[2rem] text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-2">Xác nhận xóa mã?</h3>
              <p className="text-sm text-slate-500 font-medium mb-8 italic">Các khách hàng đang lưu mã này sẽ không thể sử dụng được nữa.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 bg-slate-800 text-slate-400 font-black rounded-xl hover:bg-slate-700 transition-all uppercase text-[10px]"
                >
                  Quay lại
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-rose-500 text-white font-black rounded-xl hover:bg-rose-600 transition-all uppercase text-[10px] shadow-lg shadow-rose-500/20"
                >
                  Đồng ý xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Coupons;
