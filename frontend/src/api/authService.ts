import axiosInstance from './axiosInstance';

export const authService = {
  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (data: any) => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  }
};
