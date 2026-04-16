import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';

export interface Review {
  id: number;
  userId: number;
  userFullName: string;
  productId: number;
  productName: string;
  ratingStar: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  ratingStar: number;
  comment: string;
}

export const reviewService = {
  getReviews: (productId: number) => 
    axiosInstance.get<ApiResponse<Review[]>>(`/reviews/${productId}`),
    
  createReview: (productId: number, data: CreateReviewRequest) => 
    axiosInstance.post<ApiResponse<Review>>(`/reviews/${productId}`, data),

  getAllReviews: () =>
    axiosInstance.get<ApiResponse<Review[]>>('/reviews/admin/all')
};

export default reviewService;
