import axiosInstance from './axiosInstance';

export const productService = {
  searchProducts: async (params: { keyword?: string; categoryId?: number; minPrice?: number; maxPrice?: number; sortBy?: string; onSale?: boolean; skinType?: string; includeHidden?: boolean; page?: number; size?: number }) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data; // This returns a Page object from Spring Data
  },
  getProductById: async (id: number) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },
  getTrendingProducts: async (limit: number = 5) => {
    const response = await axiosInstance.get('/products/trending', { params: { limit } });
    return response.data;
  },
  adminCreateProduct: async (productData: any, images: File[]) => {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    const response = await axiosInstance.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  adminUpdateProduct: async (id: number, productData: any, images: File[]) => {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    const response = await axiosInstance.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  adminDeleteProduct: async (id: number) => {
    // Backend bây giờ xử lý soft-delete (chuyển status thành HIDDEN)
    await axiosInstance.delete(`/admin/products/${id}`);
  },

  adminUpdateProductStatus: async (id: number, status: string) => {
    await axiosInstance.patch(`/admin/products/${id}/status`, { status });
  },

  adminAdjustStock: async (productId: number, quantity: number, reason: string, compensationAmount?: number, variantName?: string) => {
    const response = await axiosInstance.post('/admin/inventory/adjustments', {
      productId,
      quantity,
      reason,
      compensationAmount,
      variantName
    });
    return response.data;
  },

  adminGetInventoryAdjustments: async () => {
    const response = await axiosInstance.get('/admin/inventory/adjustments');
    return response.data.data;
  },

  incrementViewCount: async (id: number) => {
    try {
      await axiosInstance.post(`/products/${id}/view`);
    } catch (error) {
      console.error("Failed to increment view count", error);
    }
  }
};

export default productService;
