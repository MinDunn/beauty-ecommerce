import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layers,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import categoryService from '../../api/categoryService';

interface Category {
  id: number;
  name: string;
  description: string;
  parentId?: number;
}

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', parentId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirm state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name, 
        description: category.description || '',
        parentId: category.parentId ? String(category.parentId) : ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', parentId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        parentId: formData.parentId === '' ? undefined : Number(formData.parentId)
      };

      if (editingCategory) {
        await categoryService.adminUpdateCategory(editingCategory.id, submitData);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryService.adminCreateCategory(submitData);
        toast.success('Tạo danh mục mới thành công');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await categoryService.adminDeleteCategory(deleteId);
      toast.success('Đã xóa danh mục');
      setDeleteId(null);
      fetchCategories();
    } catch (error) {
      toast.error('Không thể xóa danh mục này');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase underline decoration-primary-500 decoration-4 underline-offset-8">Danh mục</h1>
          <p className="text-slate-500 font-medium mt-4 italic">Quản lý các nhóm sản phẩm trên hệ thống.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Tìm tên danh mục..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all text-sm"
          />
        </div>
        <div className="bg-slate-900 px-6 py-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <Layers className="text-primary-500" size={18} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng cộng:</span>
          <span className="text-white font-black">{categories.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên danh mục</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cấp bậc / Cha</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Layers className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Không tìm thấy danh mục nào</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={cat.id} 
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-8 py-6 text-sm font-bold text-slate-500">#{cat.id}</td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-white group-hover:text-primary-500 transition-colors uppercase">{cat.name}</span>
                    </td>
                    <td className="px-8 py-6">
                      {cat.parentId ? (
                        <span className="px-3 py-1 bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase rounded-lg border border-primary-500/20">
                          Con của: {categories.find(c => c.id === cat.parentId)?.name || 'N/A'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-lg border border-slate-700">
                          Cấp cao nhất
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-400 font-medium italic line-clamp-1 max-w-xs">{cat.description || 'Chưa có mô tả'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(cat)}
                          className="p-2.5 bg-slate-800 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(cat.id)}
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
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase">{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Glowzy Management System</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widst ml-1">Tên danh mục</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all"
                      placeholder="VD: Chăm sóc da..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Danh mục cha (Nếu có)</label>
                    <select 
                      value={formData.parentId}
                      onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all appearance-none"
                    >
                      <option value="">-- Cấp cao nhất --</option>
                      {categories
                        .filter(c => !editingCategory || c.id !== editingCategory.id) // Không chọn chính nó làm cha
                        .filter(c => !c.parentId) // Chỉ chọn danh mục cấp 1 làm cha (để đảm bảo tối đa 2 cấp)
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mô tả (Không bắt buộc)</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold outline-none focus:border-primary-500 transition-all resize-none"
                      placeholder="Nhập mô tả chi tiết..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
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
                      className="flex-[2] py-4 bg-primary-500 text-white font-black rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      <span>{editingCategory ? 'Cập nhật ngay' : 'Tạo danh mục'}</span>
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
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-[2rem] text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-2">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 font-medium mb-8 italic">Lưu ý: Hành động này không thể hoàn tác. Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.</p>
              
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

export default Categories;
