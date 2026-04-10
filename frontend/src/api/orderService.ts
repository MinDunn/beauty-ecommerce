import axiosInstance from './axiosInstance';

export const orderService = {
  lookupOrder: async (orderId: string) => {
    // Note: The endpoint is public /api/orders/public/lookup/{orderId}
    // But axiosInstance base URL is already /api
    const response = await axiosInstance.get(`/orders/public/lookup/${orderId}`);
    return response.data;
  }
};
