import axiosInstance from './axiosInstance';

export const inventoryService = {
  createReceipt: async (receiptData: { productId: number; costPrice: number; quantity: number; variantName?: string; receivedAt?: string }) => {
    const response = await axiosInstance.post('/admin/inventory/receipts', receiptData);
    return response.data;
  },
  bulkCreateReceipts: async (receipts: { productId: number; costPrice: number; quantity: number; variantName?: string; receivedAt?: string }[]) => {
    const response = await axiosInstance.post('/admin/inventory/receipts/bulk', receipts);
    return response.data;
  }
};

export default inventoryService;
