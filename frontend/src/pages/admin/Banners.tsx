import { useState, useEffect } from 'react';
import { bannerService, type Banner } from '../../api/bannerService';
import { Plus, Trash2, Edit2, Save, X, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Banners = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Initial state for new/editing banner
    const [formData, setFormData] = useState<Omit<Banner, 'id'>>({
        imageUrl: '',
        title: '',
        campaign: '',
        subtitle: '',
        isActive: true,
        displayOrder: 0
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const data = await bannerService.getAllBanners();
            setBanners(data);
        } catch (error) {
            toast.error("Không thể tải danh sách banner");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.imageUrl) {
            toast.error("Vui lòng dán link URL ảnh");
            return;
        }

        try {
            if (editingId) {
                await bannerService.updateBanner(editingId, formData);
                toast.success("Đã cập nhật banner");
            } else {
                await bannerService.createBanner(formData);
                toast.success("Đã thêm banner mới");
            }
            setIsAdding(false);
            setEditingId(null);
            setFormData({ imageUrl: '', title: '', campaign: '', subtitle: '', isActive: true, displayOrder: 0 });
            fetchBanners();
        } catch (error) {
            toast.error("Lỗi khi lưu dữ liệu");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
            try {
                await bannerService.deleteBanner(id);
                toast.success("Đã xóa banner");
                fetchBanners();
            } catch (error) {
                toast.error("Lỗi khi xóa banner");
            }
        }
    };

    const startEdit = (banner: Banner) => {
        setEditingId(banner.id);
        setFormData({
            imageUrl: banner.imageUrl,
            title: banner.title,
            campaign: banner.campaign,
            subtitle: banner.subtitle,
            isActive: banner.isActive,
            displayOrder: banner.displayOrder
        });
        setIsAdding(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Quản lý Banner</h1>
                    <p className="text-slate-400 mt-1">Thay đổi hình ảnh Slide trang chủ bằng Link URL</p>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20"
                    >
                        <Plus size={20} />
                        <span>Thêm Banner Mới</span>
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white">{editingId ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}</h2>
                        <button onClick={() => {setIsAdding(false); setEditingId(null);}} className="text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Link URL Ảnh</label>
                            <input 
                                type="text"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                placeholder="Dán link ảnh tại đây (jpg, png, webp...)"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Chiến dịch (Campaign)</label>
                            <input 
                                type="text"
                                value={formData.campaign}
                                onChange={(e) => setFormData({...formData, campaign: e.target.value})}
                                placeholder="Ví dụ: Summer Sale, New Trend..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tiêu đề chính</label>
                            <input 
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Tiêu đề hiển thị to nhất"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Số thứ tự hiển thị</label>
                            <input 
                                type="number"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value)})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Mô tả phụ (Subtitle)</label>
                            <textarea 
                                value={formData.subtitle}
                                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                placeholder="Nội dung mô tả ngắn gọn..."
                                rows={3}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-4">
                        <button 
                            onClick={() => {setIsAdding(false); setEditingId(null);}}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex items-center space-x-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20"
                        >
                            <Save size={20} />
                            <span>Lưu thay đổi</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Hình ảnh</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Nội dung</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {banners.map((banner) => (
                            <tr key={banner.id} className="group hover:bg-slate-800/30 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="relative w-48 h-24 rounded-lg overflow-hidden border border-slate-700 group-hover:border-primary-500 transition-colors">
                                        <img 
                                            src={banner.imageUrl} 
                                            alt={banner.title} 
                                            className="w-full h-full object-cover"
                                        />
                                        <a 
                                            href={banner.imageUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink size={20} className="text-white" />
                                        </a>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider bg-primary-400/10 px-2 py-0.5 rounded">
                                                {banner.campaign}
                                            </span>
                                            <span className="text-xs text-slate-500">Thứ tự: {banner.displayOrder}</span>
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{banner.title}</h3>
                                        <p className="text-sm text-slate-400 line-clamp-1">{banner.subtitle}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button 
                                            onClick={() => startEdit(banner)}
                                            className="p-2 bg-slate-800 hover:bg-primary-500/20 text-slate-400 hover:text-primary-400 rounded-lg transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(banner.id)}
                                            className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {banners.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <p className="text-slate-500 font-medium italic">Chưa có banner nào được tạo. Nhấn "Thêm Banner Mới" để bắt đầu.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
