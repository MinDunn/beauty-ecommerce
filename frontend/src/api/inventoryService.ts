import axiosInstance from './axiosInstance';

export const inventoryService = {
  createReceipt: async (receiptData: { productId: number; costPrice: number; quantity: number; variantName?: string; expiryDate?: string; receivedAt?: string }) => {
    const response = await axiosInstance.post('/admin/inventory/receipts', receiptData);
    return response.data;
  },
  bulkCreateReceipts: async (receipts: { productId: number; costPrice: number; quantity: number; variantName?: string; expiryDate?: string; receivedAt?: string }[]) => {
    const response = await axiosInstance.post('/admin/inventory/receipts/bulk', receipts);
    return response.data;
  },
  auditStock: async (auditData: { productId: number; variantName?: string; physicalQuantity: number }) => {
    const response = await axiosInstance.post('/admin/inventory/audit', auditData);
    return response.data;
  },
  syncAll: async () => {
    const response = await axiosInstance.post('/admin/inventory/sync-all');
    return response.data;
  }
};

export default inventoryService;
