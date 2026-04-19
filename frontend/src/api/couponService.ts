import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';

export interface CouponData {
  id?: number;
  code: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  minOrderAmount?: number;
  expiryDate?: string;
  isActive?: boolean;
  usageLimit?: number;
  usageCount?: number;
  categoryId?: number;
  maxDiscountAmount?: number;
  minQuantity?: number;
  isNewUserOnly?: boolean;
  minSpentAmount?: number;
  description?: string;
  startDate?: string;
}

export const couponService = {
  validate: (code: string, orderValue: number, categoryIds?: (number | string)[], totalQuantity?: number) => 
    axiosInstance.get<ApiResponse<CouponData & { discountAmount: number }>>(`/coupons/validate`, {
      params: { 
        code, 
        orderValue, 
        categoryIds: categoryIds?.join(','),
        totalQuantity
      }
    }),

  getPublicVouchers: async (): Promise<Record<string, CouponData[]>> => {
    const response = await axiosInstance.get<ApiResponse<Record<string, CouponData[]>>>('/coupons');
    return response.data.data;
  },

  getAllCoupons: async () => {
    const response = await axiosInstance.get<ApiResponse<CouponData[]>>('/admin/coupons');
    return response.data.data;
  },

  createCoupon: async (data: CouponData) => {
    const response = await axiosInstance.post<ApiResponse<CouponData>>('/admin/coupons', data);
    return response.data.data;
  },

  updateCoupon: async (id: number, data: CouponData) => {
    const response = await axiosInstance.put<ApiResponse<CouponData>>(`/admin/coupons/${id}`, data);
    return response.data.data;
  },

  deleteCoupon: async (id: number) => {
    await axiosInstance.delete(`/admin/coupons/${id}`);
  }
};

export default couponService;
