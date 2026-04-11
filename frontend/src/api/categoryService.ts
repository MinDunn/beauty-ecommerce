import axiosInstance from './axiosInstance';

const categoryService = {
  getAllCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  }
};

export default categoryService;
