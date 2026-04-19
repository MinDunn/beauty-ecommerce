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
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk restock state
  const [showBulkRestockModal, setShowBulkRestockModal] = useState(false);
  const [bulkRestockItems, setBulkRestockItems] = useState<any[]>([]);
  const [selectedProductForBulk, setSelectedProductForBulk] = useState<string>("");
  const [bulkTotalPriceManual, setBulkTotalPriceManual] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    salePrice: "",
    discountValue: "",
    discountType: "FIXED" as "FIXED" | "PERCENT",
    stockQuantity: "",
    imageUrl: "",
    additionalImages: [] as string[],
    categoryId: "",
    instructions: "",
    ingredients: "",
    variants: [] as { variantName: string, price: string, imageUrl: string, stockQuantity: number, file?: File }[]
  });

  const [restockData, setRestockData] = useState({
    productId: 0,
    productName: "",
    receivedAt: getNowLocalDatetime(),
    totalPriceManual: "" as string | null,
    items: [] as { variantName: string, quantity: string, costPrice: string }[]
  });

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
        "Nước hoa"
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
        discountValue: ((product.originalPrice || 0) - (product.currentPrice || 0)).toString(),
        discountType: "FIXED",
        stockQuantity: (product.stockQuantity ?? 0).toString(),
        imageUrl: product.imageUrl || "",
        additionalImages: product.images?.filter((img: string) => img !== product.imageUrl) || [],
        categoryId: product.categoryId?.toString() || "",
        instructions: product.instructions || "",
        ingredients: product.ingredients || "",
        variants: product.variants?.map((v: any) => ({
          variantName: v.variantName,
          price: (v.price ?? 0).toString(),
          imageUrl: v.imageUrl || "",
          stockQuantity: v.stockQuantity || 0,
          file: undefined
        })) || []
      });
    } else {
      setEditingProduct(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSaving(true);
    try {
      const variantsWithIndex = formData.variants.map(v => {
        return {
          variantName: v.variantName,
          price: Number(sanitizeCurrencyInput(v.price || "0")),
          imageUrl: v.imageUrl,
          stockQuantity: v.stockQuantity || 0,
          imageIndex: undefined
        };
      });

      const productDto = {
        name: formData.name,
        description: formData.description,
        originalPrice: Number(sanitizeCurrencyInput(formData.originalPrice || "0")),
        salePrice: Number(sanitizeCurrencyInput(formData.salePrice || "0")),
        stockQuantity: editingProduct ? (parseInt(formData.stockQuantity) || 0) : 0,
        imageUrl: formData.imageUrl,
        categoryId: parseInt(formData.categoryId),
        instructions: formData.instructions,
        ingredients: formData.ingredients,
        existingImages: [] as string[],
        variants: variantsWithIndex
      };

      if (editingProduct) {
        await productService.adminUpdateProduct(editingProduct.id, productDto, []);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await productService.adminCreateProduct(productDto, []);
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
        items: prod.variants && prod.variants.length > 0 
          ? prod.variants.map((v: any) => ({ variantName: v.variantName, quantity: "", costPrice: (prod.currentPrice || 0).toString() }))
          : [{ variantName: "", quantity: "", costPrice: (prod.currentPrice || 0).toString() }]
      }]);
      setBulkTotalPriceManual(null);
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
      const flattenedItems = bulkRestockItems.flatMap(productItem => 
        productItem.items
          .filter((item: any) => parseInt(item.quantity) > 0)
          .map((item: any) => ({
            productId: productItem.productId,
            quantity: parseInt(item.quantity),
            costPrice: parseFloat(item.costPrice) || 0,
            variantName: item.variantName,
            receivedAt: getNowLocalDatetime()
          }))
      );

      if (flattenedItems.length === 0) {
        toast.error("Vui lòng nhập số lượng cho ít nhất một biến thể");
        return;
      }

      await inventoryService.bulkCreateReceipts(flattenedItems);
      toast.success(`Đã nhập hàng cho ${flattenedItems.length} đầu mục thành công!`);
      setShowBulkRestockModal(false);
      setBulkRestockItems([]);
      setBulkTotalPriceManual(null);
      fetchProducts();
    } catch (error) {
      toast.error("Lỗi khi nhập hàng hàng loạt");
    } finally {
      setIsSaving(false);
    }
  };

  const bulkTotalQuantity = bulkRestockItems.reduce((total, productItem) => 
    total + productItem.items.reduce((sum: number, item: any) => sum + (parseInt(item.quantity) || 0), 0)
  , 0);

  const bulkTotalCostCalculated = bulkRestockItems.reduce((total, productItem) => 
    total + productItem.items.reduce((sum: number, item: any) => sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.costPrice) || 0)), 0)
  , 0);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToSubmit = restockData.items.filter(item => parseInt(item.quantity) > 0);
    
    if (itemsToSubmit.length === 0) {
      toast.error("Vui lòng nhập số lượng cho ít nhất một biến thể");
      return;
    }

    setIsSaving(true);
    try {
      await inventoryService.bulkCreateReceipts(itemsToSubmit.map(item => ({
        productId: restockData.productId,
        costPrice: parseFloat(item.costPrice) || 0,
        quantity: parseInt(item.quantity),
        variantName: item.variantName,
        receivedAt: restockData.receivedAt
      })));
      toast.success(`Đã nhập hàng thành công cho ${itemsToSubmit.length} biến thể`);
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
      discountValue: "0",
      discountType: "FIXED",
      stockQuantity: "",
      imageUrl: "",
      additionalImages: [],
      categoryId: categories[0]?.id?.toString() || "",
      instructions: "",
      ingredients: "",
      variants: []
    });
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
      <div className="relative group/stock inline-block">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight cursor-help ${p.stockQuantity < 10 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
          }`}>
          {p.stockQuantity}
        </span>
        {p.variants && p.variants.length > 0 && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover/stock:block z-[9999] animate-in fade-in zoom-in duration-200">
             <div className="bg-[#0f172a] border border-slate-700 p-4 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] min-w-[200px]">
                <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                   <Package size={12} className="text-primary-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chi tiết tồn kho</p>
                </div>
                <div className="space-y-2.5">
                   {p.variants.map((v: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center gap-4">
                         <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{v.variantName}</span>
                         <span className="text-[10px] font-black text-white bg-slate-800/50 border border-slate-700 px-2 py-0.5 rounded-lg min-w-[30px] text-center">
                            {v.stockQuantity || 0}
                         </span>
                      </div>
                   ))}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Tổng cộng:</span>
                   <span className="text-[10px] font-black text-primary-500">{p.stockQuantity}</span>
                </div>
             </div>
             {/* Arrow */}
             <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-slate-700"></div>
          </div>
        )}
      </div>
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
              receivedAt: getNowLocalDatetime(),
              totalPriceManual: null,
              items: p.variants && p.variants.length > 0 
                ? p.variants.map((v: any) => ({ variantName: v.variantName, quantity: "", costPrice: (p.currentPrice || 0).toString() }))
                : [{ variantName: "", quantity: "", costPrice: (p.currentPrice || 0).toString() }]
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
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, originalPrice: sanitizeCurrencyInput(e.target.value) })}
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
                    onChange={e => setFormData({ ...formData, salePrice: sanitizeCurrencyInput(e.target.value) })}
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

            {/* Instructions & Ingredients */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hướng dẫn sử dụng</label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium resize-none"
                  placeholder="Cách dùng sản phẩm..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Thành phần</label>
                <textarea
                  rows={3}
                  value={formData.ingredients}
                  onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                  className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium resize-none"
                  placeholder="Danh sách thành phần..."
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mô tả sản phẩm</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3 rounded-2xl text-white outline-none focus:border-primary-500/50 transition-all font-medium resize-none"
              />
            </div>

            {/* Variants Section */}
            <div className="space-y-4 border-t border-slate-700/50 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Biến thể (Màu sắc, vị...)</label>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    variants: [...formData.variants, { variantName: "", price: formData.salePrice || "0", imageUrl: "", stockQuantity: 0 }]
                  })}
                  className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-400 transition-colors"
                >
                  + Thêm biến thể
                </button>
              </div>

              {formData.variants.map((variant, index) => {
                const totalPrice = (Number(sanitizeCurrencyInput(formData.salePrice || "0")) + Number(variant.price || "0")).toLocaleString();

                return (
                  <div key={index} className="bg-slate-900/50 border border-slate-700/50 p-5 rounded-[2rem] space-y-4 relative group/variant animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        variants: formData.variants.filter((_, i) => i !== index)
                      })}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/variant:opacity-100 transition-all hover:bg-rose-600 active:scale-95 z-10"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Variant Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên biến thể</label>
                        <input
                          placeholder="Màu đỏ, 100ml..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all"
                          value={variant.variantName}
                          onChange={e => {
                            const newVariants = [...formData.variants];
                            newVariants[index].variantName = e.target.value;
                            setFormData({ ...formData, variants: newVariants });
                          }}
                        />
                      </div>

                      {/* Price Difference */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giá chênh lệch (đ)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all font-black"
                          value={variant.price}
                          onChange={e => {
                            const newVariants = [...formData.variants];
                            newVariants[index].price = sanitizeCurrencyInput(e.target.value);
                            setFormData({ ...formData, variants: newVariants });
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2">
                      {/* Image URL Input */}
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Link hình ảnh biến thể</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input
                              placeholder="Dán link ảnh tại đây..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-primary-500/50 transition-all"
                              value={variant.imageUrl}
                              onChange={e => {
                                const newVariants = [...formData.variants];
                                newVariants[index].imageUrl = e.target.value;
                                setFormData({ ...formData, variants: newVariants });
                              }}
                            />
                          </div>
                          <div className="w-16 h-16 rounded-2xl border-2 border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden relative shrink-0">
                            {variant.imageUrl ? (
                              <img
                                src={variant.imageUrl}
                                className="w-full h-full object-cover"
                                alt="variant preview"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/64?text=Error";
                                }}
                              />
                            ) : (
                              <ImageIcon className="text-slate-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Total Price Display */}
                      <div className="bg-primary-500/5 border border-primary-500/10 p-3 rounded-2xl text-right min-w-[140px]">
                        <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest mb-1">Giá bán tổng cộng</p>
                        <p className="text-lg font-black text-white">{totalPrice}đ</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Image URL Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link hình ảnh chính</label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <div className="md:col-span-3 space-y-3">
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      placeholder="Dán link ảnh từ website hoặc Cloudinary..."
                      className="bg-slate-800/50 border border-slate-700 w-full pl-11 pr-4 py-3.5 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                  <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest ml-1">
                    Dán URL ảnh vào đây để tất cả thành viên đều có thể thấy hình ảnh sản phẩm.
                  </p>
                </div>

                <div className="aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-700 bg-slate-800/30 flex items-center justify-center relative group/preview shadow-xl">
                  {formData.imageUrl ? (
                    <img 
                      src={formData.imageUrl} 
                      className="w-full h-full object-cover transition-transform group-hover/preview:scale-110" 
                      alt="Main preview" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Invalid+URL";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="text-slate-700 w-8 h-8" />
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter">Chưa có ảnh</span>
                    </div>
                  )}
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover/preview:opacity-100 transition-all hover:bg-rose-600 shadow-lg"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
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
              Lập phiếu nhập hàng cho sản phẩm trong cửa hàng
            </p>
          </div>

          <form onSubmit={handleRestock} className="space-y-6">
            {/* Step 1: Select Product */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">BƯỚC 1: CHỌN SẢN PHẨM *</label>
              <select 
                className="bg-slate-800/50 border border-slate-700 w-full px-4 py-3.5 rounded-2xl text-white outline-none focus:border-emerald-500/50 transition-all font-bold appearance-none cursor-pointer"
                value={restockData.productId}
                onChange={e => {
                   const pid = parseInt(e.target.value);
                   const p = products.find(prod => prod.id === pid);
                   if (p) {
                     setRestockData({
                       ...restockData,
                       productId: pid,
                       productName: p.name,
                       totalPriceManual: null,
                       items: p.variants && p.variants.length > 0 
                         ? p.variants.map((v: any) => ({ variantName: v.variantName, quantity: "", costPrice: (p.currentPrice || 0).toString() }))
                         : [{ variantName: "", quantity: "", costPrice: (p.currentPrice || 0).toString() }]
                     });
                   }
                }}
              >
                <option value={0}>-- Chọn sản phẩm --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Variant Table */}
            {restockData.productId > 0 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">BƯỚC 2: NHẬP SỐ LƯỢNG & GIÁ CHO TỪNG BIẾN THỂ</label>
                <div className="bg-slate-800/30 rounded-3xl border border-slate-700/50 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">Biến thể</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase w-24">Số lượng</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">Giá nhập ($)</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {restockData.items.map((item, idx) => {
                        const subtotal = (parseInt(item.quantity) || 0) * (parseFloat(item.costPrice) || 0);
                        return (
                          <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-xs font-bold text-slate-300">
                              {item.variantName || "Mặc định"}
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white text-xs outline-none focus:border-emerald-500/50"
                                value={item.quantity}
                                onChange={e => {
                                  const newItems = [...restockData.items];
                                  newItems[idx].quantity = e.target.value;
                                  setRestockData({...restockData, items: newItems, totalPriceManual: null});
                                }}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number"
                                step="0.01"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white text-xs outline-none focus:border-emerald-500/50"
                                value={item.costPrice}
                                onChange={e => {
                                  const newItems = [...restockData.items];
                                  newItems[idx].costPrice = e.target.value;
                                  setRestockData({...restockData, items: newItems, totalPriceManual: null});
                                }}
                              />
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-black text-white">
                              {subtotal.toLocaleString()}$
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary */}
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-700/50 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Tổng số lượng nhập:</span>
                    <span className="text-white font-black text-lg">
                      {restockData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Tổng giá trị đơn hàng ($):</span>
                    <div className="flex flex-col items-end gap-1">
                      <input 
                        type="number"
                        step="0.01"
                        placeholder="Tính toán tự động..."
                        className="bg-slate-800 border border-emerald-500/30 rounded-xl px-4 py-1.5 text-right text-emerald-500 text-xl font-black outline-none focus:border-emerald-500 transition-all w-48"
                        value={restockData.totalPriceManual !== null 
                          ? restockData.totalPriceManual 
                          : restockData.items.reduce((sum, item) => sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.costPrice) || 0)), 0)}
                        onChange={e => setRestockData({...restockData, totalPriceManual: e.target.value})}
                      />
                      <p className="text-[9px] text-slate-600 font-medium italic">Bạn có thể sửa tay tổng tiền nếu có phí phát sinh</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
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
                disabled={isSaving || restockData.productId === 0}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/20 disabled:text-slate-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <span>Xác nhận nhập kho</span>
                )}
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
            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {bulkRestockItems.length === 0 ? (
                <div className="py-12 text-center bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-800">
                  <p className="text-slate-500 text-sm italic">Chưa chọn sản phẩm nào để nhập hàng</p>
                </div>
              ) : (
                bulkRestockItems.map((productItem, productIdx) => (
                  <div key={productItem.productId} className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-slate-800/60 p-4 flex justify-between items-center border-b border-slate-700/50">
                      <div className="flex items-center gap-2 text-primary-500">
                        <Package size={16} />
                        <span className="font-bold text-white text-sm">{productItem.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkRestockItems(bulkRestockItems.filter((_, i) => i !== productIdx));
                          setBulkTotalPriceManual(null);
                        }}
                        className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="p-0">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/40">
                          <tr>
                            <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Biến thể</th>
                            <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest w-20">Số lượng</th>
                            <th className="px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Giá nhập ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                          {productItem.items.map((vItem: any, vIdx: number) => (
                            <tr key={vIdx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-2.5 text-xs text-slate-300 font-medium italic">
                                {vItem.variantName || "Mặc định"}
                              </td>
                              <td className="px-4 py-2.5">
                                <input
                                  type="number"
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-primary-500/50"
                                  value={vItem.quantity}
                                  onChange={(e) => {
                                    const newBulk = [...bulkRestockItems];
                                    newBulk[productIdx].items[vIdx].quantity = e.target.value;
                                    setBulkRestockItems(newBulk);
                                    setBulkTotalPriceManual(null);
                                  }}
                                />
                              </td>
                              <td className="px-4 py-2.5">
                                <input
                                  type="number"
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-primary-500/50"
                                  value={vItem.costPrice}
                                  onChange={(e) => {
                                    const newBulk = [...bulkRestockItems];
                                    newBulk[productIdx].items[vIdx].costPrice = e.target.value;
                                    setBulkRestockItems(newBulk);
                                    setBulkTotalPriceManual(null);
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculation Summary & Action */}
            {bulkRestockItems.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-700/50 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Tổng số lượng (đơn vị):</span>
                    <span className="text-white font-black text-lg">{bulkTotalQuantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Tổng giá trị đơn hàng ($):</span>
                    <div className="flex flex-col items-end gap-1">
                      <input 
                        type="number"
                        step="0.01"
                        className="bg-slate-800 border border-emerald-500/30 rounded-xl px-4 py-1.5 text-right text-emerald-500 text-xl font-black outline-none focus:border-emerald-500 transition-all w-48"
                        value={bulkTotalPriceManual !== null ? bulkTotalPriceManual : bulkTotalCostCalculated}
                        onChange={e => setBulkTotalPriceManual(e.target.value)}
                      />
                      <p className="text-[9px] text-slate-600 font-medium italic">Cho phép sửa tay tổng tiền</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBulkRestockSubmit}
                  disabled={isSaving}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Xác nhận nhập hàng hàng loạt
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};