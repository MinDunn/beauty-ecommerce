import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  totalCustomers: number;
  customerGrowth: number;
  totalFeedback: number;
  feedbackGrowth: number;
  revenueHistory: Array<{ date: string; revenue: number }>;
  recentOrders: Array<{
    id: number;
    name: string;
    amount: number;
    status: string;
  }>;
  topRatedProducts: Array<{ name: string; count: number }>;
  topFavoritedProducts: Array<{ name: string; count: number; salesCount: number }>;
}

export interface ActivityLog {
  id: number;
  action: string;
  module: string;
  username: string;
  details: string;
  timestamp: string;
}

export const adminService = {
  getDashboardStats: async (days: number = 7): Promise<DashboardStats> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>(`/admin/dashboard/stats?days=${days}`);
    return response.data.data;
  },
  getRecentActivities: async (): Promise<ActivityLog[]> => {
    const response = await axiosInstance.get<ApiResponse<ActivityLog[]>>('/admin/activities');
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
  }
};

export default adminService;
