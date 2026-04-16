import axiosInstance from './axiosInstance';

export const adminService = {
  getDashboardStats: async (days: number = 7) => {
    const response = await axiosInstance.get(`/admin/dashboard/stats?days=${days}`);
    return response.data.data; // ApiResponse<DashboardResponse>
  },
  getRecentActivities: async () => {
    const response = await axiosInstance.get('/admin/activities');
    return response.data.data; // ApiResponse<List<ActivityLog>>
  },
  exportReport: async () => {
    const response = await axiosInstance.get('/admin/reports/export', {
      responseType: 'blob'
    });
    return response.data;
  },
  getInventoryReceipts: async () => {
    const response = await axiosInstance.get('/admin/inventory/receipts');
    return response.data.data; // ApiResponse<List<InventoryReceiptResponse>>
  }
};

export default adminService;
