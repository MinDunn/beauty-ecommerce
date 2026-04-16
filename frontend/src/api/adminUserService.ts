import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
}

export const adminUserService = {
  getAllUsers: () => 
    axiosInstance.get<ApiResponse<AdminUser[]>>('/admin/users'),
    
  updateUserRole: (id: number, role: string) => 
    axiosInstance.put<ApiResponse<void>>(`/admin/users/${id}/role`, { role }),
    
  updateUserStatus: (id: number, isActive: boolean) => 
    axiosInstance.put<ApiResponse<void>>(`/admin/users/${id}/status`, { isActive }),

  updateUserDetails: (id: number, data: { fullName: string; phone: string; address: string }) =>
    axiosInstance.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, data),

  createUser: (data: any) =>
    axiosInstance.post<ApiResponse<AdminUser>>(`/admin/users`, data)
};

export default adminUserService;
