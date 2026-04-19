import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface Banner {
  id: number;
  imageUrl: string;
  title: string;
  campaign: string;
  subtitle: string;
  isActive: boolean;
  displayOrder: number;
}

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const bannerService = {
  // Lay danh sach banner cho trang chu (Cong khai)
  getActiveBanners: async () => {
    const response = await axios.get<Banner[]>(`${API_URL}/banners`);
    return response.data;
  },

  // Cac API cho Admin (Yeu cau token)
  getAllBanners: async () => {
    const response = await axios.get<Banner[]>(`${API_URL}/banners/admin/all`, getHeaders());
    return response.data;
  },

  updateBanner: async (id: number, banner: Partial<Banner>) => {
    const response = await axios.put<Banner>(`${API_URL}/banners/${id}`, banner, getHeaders());
    return response.data;
  },

  createBanner: async (banner: Omit<Banner, 'id'>) => {
    const response = await axios.post<Banner>(`${API_URL}/banners`, banner, getHeaders());
    return response.data;
  },

  deleteBanner: async (id: number) => {
    await axios.delete(`${API_URL}/banners/${id}`, getHeaders());
  }
};
