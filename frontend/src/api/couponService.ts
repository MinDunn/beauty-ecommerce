import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';

export interface CouponData {
  code: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  maxDiscount?: number;
}

export const couponService = {
  validate: (code: string, orderValue: number) => 
    axiosInstance.get<ApiResponse<CouponData>>(`/coupons/validate`, {
      params: { code, orderValue }
    })
};

export default couponService;
