import { useState, useEffect } from "react";
import type { Product, Category } from "../types";
import { Table } from "../components/admin/Table";
import { Modal } from "../components/admin/Modal";
import { productService } from "../api/productService";
import { categoryService } from "../api/categoryService";
import { toast } from "react-hot-toast";
import { Plus, Save, Package, DollarSign, Tag, Image as ImageIcon, Loader2, Edit2, Trash2 } from "lucide-react";

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    salePrice: "",
    stockQuantity: "",
    categoryId: ""
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.searchProducts({ size: 100 });
      setProducts(data.content);
    } catch (error) {
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        originalPrice: (product.originalPrice ?? 0).toString(),
        salePrice: (product.currentPrice ?? 0).toString(),
        stockQuantity: (product.stockQuantity ?? 0).toString(),
        categoryId: product.categoryId?.toString() || ""
      });
      setPreview(product.imageUrl || null);
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSaving(true);
    try {
      const productDto = {
        name: formData.name,
        description: formData.description,
        originalPrice: parseFloat(formData.originalPrice),
        salePrice: parseFloat(formData.salePrice),
        stockQuantity: parseInt(formData.stockQuantity),
        categoryId: parseInt(formData.categoryId)
      };

      if (editingProduct) {
        await productService.adminUpdateProduct(editingProduct.id, productDto, selectedImage);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await productService.adminCreateProduct(productDto, selectedImage);
        toast.success("Đã thêm sản phẩm thành công!");
      }
      
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error("Lỗi khi lưu sản phẩm");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productService.adminDeleteProduct(id);
        toast.success("Xóa thành công");
        fetchProducts();
      } catch (error) {
        toast.error("Lỗi khi xóa sản phẩm");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      originalPrice: "",
      salePrice: "",
      stockQuantity: "",
      categoryId: categories[0]?.id?.toString() || ""
    });
    setSelectedImage(null);
    setPreview(null);
  };

  const tableData = products.map(p => ({
    name: (
      <div className="flex items-center gap-3">
        {p.imageUrl && <img src={p.imageUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm" />}
        <span className="font-bold text-slate-200">{p.name}</span>
      </div>
    ),
    price: (
      <div className="flex flex-col">
        <span className="font-black text-white">{p.currentPrice.toLocaleString()}đ</span>
        {p.originalPrice > p.currentPrice && (
          <span className="text-[10px] text-slate-500 line-through">{p.originalPrice.toLocaleString()}đ</span>
        )}
      </div>
    ),
    category: categories.find(c => c.id === p.categoryId)?.name || "Chưa phân loại",
    stock: (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
        p.stockQuantity < 10 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
      }`}>
        {p.stockQuantity} con lại
      </span>
    ),
    actions: (
      <div className="flex items-center gap-2">
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); handleOpenModal(p); }} 
          className="p-2.5 hover:bg-slate-800 rounded-xl text-primary-500 transition-all active:scale-90"
        >
          <Edit2 size={16} />
        </button>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} 
          className="p-2.5 hover:bg-slate-800 rounded-xl text-rose-500 transition-all active:scale-90"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Quản lý sản phẩm</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Danh sách tất cả sản phẩm trong cửa hàng của bạn</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
        >
          <Plus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-4 shadow-xl">
          <div className="p-4 rounded-2xl bg-primary-500/10 text-primary-500"><Package size={28} /></div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Tổng sản phẩm</p>
            <p className="text-2xl font-black text-white">{products.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <Table 
            columns={[
              { header: "Tên sản phẩm", key: "name" },
              { header: "Giá hiện tại", key: "price" },
              { header: "Danh mục", key: "category" },
              { header: "Tồn kho", key: "stock" },
              { header: "Thao tác", key: "actions" }
            ]} 
            data={tableData} 
          />
        )}
      </div>

      {showModal && (
        <Modal onClose={() => !isSaving && setShowModal(false)}>
          <div className="mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              {editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-1">
              {editingProduct ? "Chỉnh sửa thông tin sản phẩm và lưu lại" : "Điền đầy đủ thông tin bên dưới để tạo sản phẩm"}
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên sản phẩm *</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  required
                  placeholder="Nhập tên sản phẩm..." 
                  className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Danh mục *</label>
                <select 
                  required
                  className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3.5 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="" disabled>Chọn danh mục</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tồn kho</label>
                <div className="relative group">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="number"
                    placeholder="0" 
                    className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium" 
                    value={formData.stockQuantity}
                    onChange={e => setFormData({...formData, stockQuantity: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Original Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giá gốc</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="number"
                    placeholder="0" 
                    className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium" 
                    value={formData.originalPrice}
                    onChange={e => setFormData({...formData, originalPrice: e.target.value})}
                  />
                </div>
              </div>

              {/* Sale Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giá khuyến mãi</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="number"
                    placeholder="0" 
                    className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium" 
                    value={formData.salePrice}
                    onChange={e => setFormData({...formData, salePrice: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mô tả sản phẩm</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium resize-none" 
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hình ảnh sản phẩm</label>
              <div className="relative group">
                 <input 
                    type="file" 
                    id="image-upload"
                    className="hidden" 
                    onChange={handleImage}
                    accept="image/*"
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 bg-slate-800/30 rounded-2xl p-6 cursor-pointer hover:border-primary-500/50 hover:bg-slate-800/50 transition-all group"
                  >
                    {preview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl border border-slate-700 text-center">
                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white text-xs font-black uppercase tracking-widest">Thay đổi ảnh</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-primary-500 group-hover:scale-110 transition-all">
                          <ImageIcon className="text-slate-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Chọn ảnh từ máy tính</span>
                        <span className="text-[10px] text-slate-600 mt-1 uppercase font-black">JPG, PNG, WEBP max 2MB</span>
                      </>
                    )}
                  </label>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                disabled={isSaving}
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-800 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-primary-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                <span>{isSaving ? "Đang lưu..." : (editingProduct ? "Cập nhật" : "Lưu sản phẩm")}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};