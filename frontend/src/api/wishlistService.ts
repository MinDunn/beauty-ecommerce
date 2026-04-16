import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';
import type { Product } from '../types';

export const wishlistService = {
  getWishlist: () => 
    axiosInstance.get<ApiResponse<Product[]>>('/wishlist'),
    
  addToWishlist: (productId: number) => 
    axiosInstance.post<ApiResponse<void>>(`/wishlist/${productId}`),
    
  removeFromWishlist: (productId: number) => 
    axiosInstance.delete<ApiResponse<void>>(`/wishlist/${productId}`),
    
  checkWishlist: (productId: number) => 
    axiosInstance.get<ApiResponse<boolean>>(`/wishlist/check/${productId}`)
};

export default wishlistService;
