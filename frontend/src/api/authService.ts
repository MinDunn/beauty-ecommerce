import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authService = {
  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: (data: ResetPasswordRequest) => 
    axiosInstance.post<ApiResponse<void>>('/auth/reset-password', data),

  loginWithGoogle: (credential: string) =>
    axiosInstance.post<ApiResponse<any>>('/auth/google', { credential }),

  getProfile: () => 
    axiosInstance.get<ApiResponse<UserProfile>>('/users/profile'),

  updateProfile: (data: Partial<UserProfile>) => 
    axiosInstance.put<ApiResponse<UserProfile>>('/users/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<ApiResponse<string>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  changePassword: (data: any) => 
    axiosInstance.post<ApiResponse<void>>('/users/change-password', data),

  logout: () => 
    axiosInstance.post<ApiResponse<void>>('/auth/logout')
};

export default authService;
