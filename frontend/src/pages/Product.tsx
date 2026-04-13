import { useState, useEffect } from "react";
import type { Product, Category } from "../types";
import { Table } from "../components/admin/Table";
import { Modal } from "../components/admin/Modal";
import { productService } from "../api/productService";
import { categoryService } from "../api/categoryService";
import { inventoryService } from "../api/inventoryService";
import { toast } from "react-hot-toast";
import { Plus, Save, Package, DollarSign, Tag, Image as ImageIcon, Loader2, Edit2, Trash2, Search, Warehouse, X } from "lucide-react";

const getNowLocalDatetime = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const sanitizeCurrencyInput = (value: string) => value.replace(/[^\d]/g, "");

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Bulk restock state
  const [showBulkRestockModal, setShowBulkRestockModal] = useState(false);
  const [bulkRestockItems, setBulkRestockItems] = useState<any[]>([]);
  const [selectedProductForBulk, setSelectedProductForBulk] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    salePrice: "",
    stockQuantity: "",
    categoryId: "",
    instructions: "",
    ingredients: ""
  });
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockData, setRestockData] = useState({
    productId: 0,
    productName: "",
    costPrice: "",
    quantity: "",
    receivedAt: getNowLocalDatetime()
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
      const homeCategoryOrder = [
        "Chăm sóc da",
        "Trang điểm",
        "Chăm sóc tóc",
        "Chăm sóc cơ thể",
        "Thực phẩm chức năng"
      ];
      const categoryByName = new Map(data.map((category: Category) => [category.name, category]));
      const orderedCategories = homeCategoryOrder
        .map((name) => categoryByName.get(name))
        .filter((category): category is Category => Boolean(category));
      setCategories(orderedCategories);
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
        categoryId: product.categoryId?.toString() || "",
        instructions: product.instructions || "",
        ingredients: product.ingredients || ""
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
        originalPrice: Number(sanitizeCurrencyInput(formData.originalPrice || "0")),
        salePrice: Number(sanitizeCurrencyInput(formData.salePrice || "0")),
        stockQuantity: editingProduct ? parseInt(formData.stockQuantity) : 0,
        categoryId: parseInt(formData.categoryId),
        instructions: formData.instructions,
        ingredients: formData.ingredients
      };

      console.log("DEBUG: Sending Product DTO:", productDto);

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

  const handleAddProductToBulk = () => {
    if (!selectedProductForBulk) return;
    const prod = products.find(p => p.id.toString() === selectedProductForBulk);
    if (prod && !bulkRestockItems.find(item => item.productId === prod.id)) {
      setBulkRestockItems([...bulkRestockItems, {
        productId: prod.id,
        name: prod.name,
        quantity: 1,
        costPrice: prod.currentPrice || 0
      }]);
    }
    setSelectedProductForBulk("");
  };

  const handleBulkRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkRestockItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }
    
    setIsSaving(true);
    try {
      await inventoryService.bulkCreateReceipts(bulkRestockItems.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity.toString()),
        costPrice: parseFloat(item.costPrice.toString())
      })));
      toast.success(`Đã nhập hàng cho ${bulkRestockItems.length} sản phẩm thành công!`);
      setShowBulkRestockModal(false);
      setBulkRestockItems([]);
      fetchProducts();
    } catch (error) {
      toast.error("Lỗi khi nhập hàng hàng loạt");
    } finally {
      setIsSaving(false);
    }
  };

  const bulkTotalQuantity = bulkRestockItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  const bulkTotalCost = bulkRestockItems.reduce((sum, item) => sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.costPrice) || 0)), 0);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockData.costPrice || !restockData.quantity) {
      toast.error("Vui lòng nhập giá nhập và số lượng");
      return;
    }

    setIsSaving(true);
    try {
      await inventoryService.createReceipt({
        productId: restockData.productId,
        costPrice: parseFloat(restockData.costPrice),
        quantity: parseInt(restockData.quantity),
        receivedAt: restockData.receivedAt
      });
      toast.success(`Đã nhập thêm ${restockData.quantity} sản phẩm cho ${restockData.productName}`);
      setShowRestockModal(false);
      fetchProducts();
    } catch (error) {
      toast.error("Lỗi khi nhập hàng");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      originalPrice: "",
      salePrice: "",
      stockQuantity: "",
      categoryId: categories[0]?.id?.toString() || "",
      instructions: "",
      ingredients: ""
    });
    setSelectedImage(null);
    setPreview(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tableData = filteredProducts.map(p => ({
    name: (
      <div className="flex items-center gap-3">
        {p.imageUrl && (
          <img 
            src={p.imageUrl.startsWith("http") ? p.imageUrl : 
                 p.imageUrl.startsWith("/uploads/") ? p.imageUrl : 
                 `/images/${p.imageUrl}`} 
            className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-800"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540555700478-4be289fbecee?auto=format&fit=crop&w=600&q=80";
            }}
          />
        )}
        <span className="font-bold text-slate-200">{p.name}</span>
      </div>
    ),
    price: (
      <div className="flex flex-col">
        <span className="font-black text-white">{(p.currentPrice || 0).toLocaleString()}đ</span>
        {(p.originalPrice || 0) > (p.currentPrice || 0) && (
          <span className="text-[10px] text-slate-500 line-through">{(p.originalPrice || 0).toLocaleString()}đ</span>
        )}
      </div>
    ),
    category: categories.find(c => String(c.id) === String(p.categoryId))?.name || "Đang tải...",
    stock: (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
        p.stockQuantity < 10 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
      }`}>
        {p.stockQuantity} đơn vị
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
          onClick={(e) => { 
            e.stopPropagation(); 
            setRestockData({
              productId: p.id,
              productName: p.name,
              costPrice: "",
              quantity: "",
              receivedAt: getNowLocalDatetime()
            });
            setShowRestockModal(true);
          }} 
          className="p-2.5 hover:bg-slate-800 rounded-xl text-emerald-500 transition-all active:scale-90"
          title="Nhập hàng"
        >
          <Plus size={16} />
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Quản lý sản phẩm</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Danh sách tất cả sản phẩm trong cửa hàng của bạn</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm theo tên..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium placeholder:text-slate-600"
            />
          </div>

          <button 
            onClick={() => setShowBulkRestockModal(true)} 
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-500/20 active:scale-95 shrink-0"
          >
            <Warehouse size={18} />
            <span className="hidden sm:inline">Nhập hàng</span>
          </button>

          <button 
            onClick={() => handleOpenModal()} 
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-95 shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Thêm sản phẩm</span>
          </button>
        </div>
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
          <div className="max-h-[410px] overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-800">
            <Table 
              columns={[
                { header: "Tên sản phẩm", key: "name" },
                { header: "Giá hiện tại", key: "price" },
                { header: "Danh mục", key: "category" },
                { header: "Số lượng", key: "stock" },
                { header: "Thao tác", key: "actions" }
              ]} 
              data={tableData} 
            />
          </div>
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

            <div className="grid grid-cols-1 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Danh mục *</label>
                <select 
                  required
                  className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3.5 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium appearance-none"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="" disabled>Chọn danh mục</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Original Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giá gốc</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="0" 
                    className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium" 
                    value={formData.originalPrice}
                    onChange={e => setFormData({...formData, originalPrice: sanitizeCurrencyInput(e.target.value)})}
                  />
                </div>
              </div>

              {/* Sale Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giá khuyến mãi</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="0" 
                    className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium" 
                    value={formData.salePrice}
                    onChange={e => setFormData({...formData, salePrice: sanitizeCurrencyInput(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ngày giờ nhập</label>
              <input
                type="datetime-local"
                required
                className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3.5 rounded-2xl text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                value={restockData.receivedAt}
                onChange={e => setRestockData({ ...restockData, receivedAt: e.target.value })}
              />
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

            <div className="grid grid-cols-2 gap-4">
              {/* Instructions */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hướng dẫn sử dụng</label>
                <textarea 
                  rows={3}
                  value={formData.instructions}
                  onChange={e => setFormData({...formData, instructions: e.target.value})}
                  className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium resize-none" 
                  placeholder="Cách dùng sản phẩm..."
                />
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Thành phần</label>
                <textarea 
                  rows={3}
                  value={formData.ingredients}
                  onChange={e => setFormData({...formData, ingredients: e.target.value})}
                  className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium resize-none" 
                  placeholder="Bảng thành phần..."
                />
              </div>
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

      {showRestockModal && (
        <Modal onClose={() => !isSaving && setShowRestockModal(false)}>
          <div className="mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Package className="text-emerald-500" />
              Nhập hàng vào kho
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Sản phẩm: <span className="text-white font-bold">{restockData.productName}</span>
            </p>
          </div>

          <form onSubmit={handleRestock} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giá nhập mỗi đơn vị ($)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00" 
                    className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                    value={restockData.costPrice}
                    onChange={e => setRestockData({...restockData, costPrice: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số lượng nhập</label>
                <div className="relative group">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="number"
                    required
                    placeholder="0" 
                    className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                    value={restockData.quantity}
                    onChange={e => setRestockData({...restockData, quantity: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                type="button"
                disabled={isSaving}
                onClick={() => setShowRestockModal(false)} 
                className="px-6 py-3 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 group active:scale-95"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                Xác nhận nhập hàng
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Restock Modal */}
      {showBulkRestockModal && (
        <Modal onClose={() => !isSaving && setShowBulkRestockModal(false)}>
          <div className="mb-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Warehouse className="text-emerald-500" />
              Nhập hàng hàng loạt
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Chọn các sản phẩm đã có và nhập số lượng/giá để cập nhật kho
            </p>
          </div>

          <div className="space-y-4">
            {/* Product Selector */}
            <div className="flex gap-2 items-center">
              <select 
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary-500/50 min-w-0"
                value={selectedProductForBulk}
                onChange={(e) => setSelectedProductForBulk(e.target.value)}
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products
                  .filter(p => !bulkRestockItems.find(item => item.productId === p.id))
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                }
              </select>
              <button 
                type="button"
                onClick={handleAddProductToBulk}
                disabled={!selectedProductForBulk}
                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold disabled:opacity-50 disabled:grayscale transition-all shrink-0 shadow-lg shadow-primary-500/10 active:scale-95"
              >
                Thêm
              </button>
            </div>

            {/* Selected Items List */}
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {bulkRestockItems.length === 0 ? (
                <div className="py-12 text-center bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-800">
                  <p className="text-slate-500 text-sm italic">Chưa chọn sản phẩm nào để nhập hàng</p>
                </div>
              ) : (
                bulkRestockItems.map((item, index) => (
                  <div key={item.productId} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 group animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <button 
                        type="button"
                        onClick={() => setBulkRestockItems(bulkRestockItems.filter((_, i) => i !== index))}
                        className="text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số lượng</label>
                        <input 
                          type="number"
                          min="1"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-primary-500/50"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...bulkRestockItems];
                            newItems[index].quantity = parseInt(e.target.value) || 0;
                            setBulkRestockItems(newItems);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Đơn giá nhập</label>
                        <input 
                          type="number"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-primary-500/50"
                          value={item.costPrice}
                          onChange={(e) => {
                            const newItems = [...bulkRestockItems];
                            newItems[index].costPrice = parseFloat(e.target.value) || 0;
                            setBulkRestockItems(newItems);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculation Summary & Action */}
            {bulkRestockItems.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Tổng số lượng:</span>
                  <span className="text-white font-black">{bulkTotalQuantity.toLocaleString()} đơn vị</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Tổng giá trị đơn nhập:</span>
                  <span className="text-emerald-500 text-xl font-black">{bulkTotalCost.toLocaleString()}đ</span>
                </div>
                
                <button 
                  onClick={handleBulkRestockSubmit}
                  disabled={isSaving}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Xác nhận nhập hàng
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};