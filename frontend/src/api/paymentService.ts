import axiosInstance from './axiosInstance';

export const paymentService = {
  createMomoPayment: async (orderId: number) => {
    const response = await axiosInstance.post('/payment/create-momo', { orderId });
    return response.data;
  }
};
