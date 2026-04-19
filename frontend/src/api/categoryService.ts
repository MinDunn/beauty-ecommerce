import axiosInstance from './axiosInstance';

export const categoryService = {
  getAllCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data.data; // Unwrapping ApiResponse<List<CategoryResponse>>
  },
  adminCreateCategory: async (data: { name: string; description: string; parentId?: number }) => {
    const response = await axiosInstance.post('/admin/categories', data);
    return response.data.data;
  },
  adminUpdateCategory: async (id: number, data: { name: string; description: string; parentId?: number }) => {
    const response = await axiosInstance.put(`/admin/categories/${id}`, data);
    return response.data.data;
  },
  adminDeleteCategory: async (id: number) => {
    await axiosInstance.delete(`/admin/categories/${id}`);
  }
};

export default categoryService;
