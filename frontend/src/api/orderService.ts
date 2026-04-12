import axiosInstance from './axiosInstance';

export const orderService = {
  lookupOrder: async (orderId: string) => {
    const response = await axiosInstance.get(`/orders/public/lookup/${orderId}`);
    return response.data;
  },
  placeOrder: async (data: { receiverName: string; receiverPhone: string; shippingAddress: string; paymentMethod: string }) => {
    const response = await axiosInstance.post('/orders', data);
    return response.data;
  },
  getOrderHistory: async () => {
    const response = await axiosInstance.get('/orders/history');
    return response.data;
  },
  adminGetAllOrders: async () => {
    const response = await axiosInstance.get('/admin/orders');
    return response.data;
  },
  adminUpdateOrderStatus: async (id: number, status: string) => {
    await axiosInstance.put(`/admin/orders/${id}/status`, null, {
      params: { status }
    });
  }
};

export default orderService;
