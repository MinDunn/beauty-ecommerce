import axiosInstance from './axiosInstance';

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export const settingService = {
  getAllSettings: async () => {
    const response = await axiosInstance.get('/settings');
    return response.data.data;
  },

  getShippingSettings: async () => {
    const response = await axiosInstance.get('/settings/shipping');
    return response.data.data;
  },

  updateSettings: async (settings: Record<string, string>) => {
    const response = await axiosInstance.put('/settings', settings);
    return response.data;
  }
};
