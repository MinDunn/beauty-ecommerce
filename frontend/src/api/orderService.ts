import axiosInstance from './axiosInstance';

export const orderService = {
  lookupOrder: async (orderId: string) => {
    const response = await axiosInstance.get(`/orders/public/lookup/${orderId}`);
    return response.data;
  },
  placeOrder: async (data: { 
    receiverName: string; 
    receiverPhone: string; 
    shippingAddress: string; 
    paymentMethod: string; 
    couponCode?: string;
    checkoutItems?: { productId: number; variantName: string | null }[];
  }) => {
    const response = await axiosInstance.post('/orders', data);
    return response.data;
  },
  getOrderHistory: async () => {
    const response = await axiosInstance.get('/orders/history');
    return response.data;
  },
  cancelOrder: async (orderId: number, reason?: string) => {
    const response = await axiosInstance.put(`/orders/${orderId}/cancel`, null, {
      params: { reason }
    });
    return response.data;
  },
  adminGetAllOrders: async (params?: { search?: string; status?: string }) => {
    const response = await axiosInstance.get('/admin/orders', { params });
    return response.data;
  },
  adminUpdateOrderStatus: async (id: number, status: string) => {
    await axiosInstance.put(`/admin/orders/${id}/status`, null, {
      params: { status }
    });
  },
  adminBulkUpdateStatus: async (ids: number[], status: string) => {
    await axiosInstance.put('/admin/orders/bulk-status', { ids, status });
  },
  adminApproveCancellation: async (id: number) => {
    await axiosInstance.put(`/admin/orders/${id}/approve-cancel`);
  },
  adminRejectCancellation: async (id: number) => {
    await axiosInstance.put(`/admin/orders/${id}/reject-cancel`);
  },
  adminConfirmPayment: async (id: number) => {
    await axiosInstance.put(`/admin/orders/${id}/confirm-payment`);
  }
};

export default orderService;
