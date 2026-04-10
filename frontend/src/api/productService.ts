import axiosInstance from './axiosInstance';

export const productService = {
  searchProducts: async (params: { keyword?: string; categoryId?: number; minPrice?: number; maxPrice?: number; sortBy?: string; page?: number; size?: number }) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data; // This returns a Page object from Spring Data
  },
  getProductById: async (id: number) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  }
};
