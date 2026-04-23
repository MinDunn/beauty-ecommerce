import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';

export interface DashboardStats {
  totalRevenue: number;
  totalProfit: number;
  revenueGrowth: number;
  profitGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  totalCustomers: number;
  customerGrowth: number;
  totalFeedback: number;
  feedbackGrowth: number;
  totalCost: number;
  totalInventoryLoss: number;
  totalCompensation: number;
  revenueHistory: Array<{ date: string; revenue: number; profit: number }>;
  recentOrders: Array<{
    id: number;
    name: string;
    amount: number;
    status: string;
  }>;
  topRatedProducts: Array<{ name: string; count: number }>;
  topFavoritedProducts: Array<{ name: string; count: number; salesCount: number }>;
  revenueByCategory: Array<{ name: string; revenue: number }>;
  orderStatusDistribution: Array<{ status: string; count: number }>;
}

export interface ActivityLog {
  id: number;
  userId: number | null;
  userEmail: string;
  actionType: string;
  actionGroup: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export const adminService = {
  getDashboardStats: async (days: number = 7): Promise<DashboardStats> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>(`/admin/dashboard/stats?days=${days}`);
    return response.data.data;
  },
  getRecentActivities: async (group?: string, query?: string): Promise<ActivityLog[]> => {
    let url = '/admin/activities';
    const params = new URLSearchParams();
    if (group && group !== 'ALL') params.append('group', group);
    if (query && query.trim()) params.append('query', query.trim());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await axiosInstance.get<ApiResponse<ActivityLog[]>>(url);
    return response.data.data;
  },
  exportReport: async () => {
    const response = await axiosInstance.get('/admin/reports/export', {
      responseType: 'blob'
    });
    return response.data;
  },
  getInventoryReceipts: async () => {
    const response = await axiosInstance.get<ApiResponse<any[]>>('/admin/inventory/receipts');
    return response.data.data;
  },
  getPendingAdjustments: async () => {
    const response = await axiosInstance.get<ApiResponse<any[]>>('/admin/inventory/adjustments/pending');
    return response.data.data;
  },
  approveAdjustment: async (id: number) => {
    await axiosInstance.post(`/admin/inventory/adjustments/approve?id=${id}`);
  },
  rejectAdjustment: async (id: number) => {
    await axiosInstance.post(`/admin/inventory/adjustments/reject?id=${id}`);
  },
  deleteAdjustments: async (ids: number[]) => {
    await axiosInstance.delete('/admin/inventory/adjustments', { data: ids });
  },
  deleteAllAdjustments: async () => {
    await axiosInstance.delete('/admin/inventory/adjustments/all');
  }
};

export default adminService;
