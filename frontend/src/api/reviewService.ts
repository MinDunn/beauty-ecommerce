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
  adminReply: string | null;
  repliedAt: string | null;
  isEdited: boolean;
  createdAt: string;
}

export interface CreateReviewRequest {
  ratingStar: number;
  comment: string;
}

export interface UpdateReviewRequest {
  ratingStar: number;
  comment: string;
}

export interface ReplyReviewRequest {
  reply: string;
}

export const reviewService = {
  getReviews: (productId: number) => 
    axiosInstance.get<ApiResponse<Review[]>>(`/reviews/${productId}`),
    
  createReview: (productId: number, data: CreateReviewRequest) => 
    axiosInstance.post<ApiResponse<Review>>(`/reviews/${productId}`, data),

  getAllReviews: () =>
    axiosInstance.get<ApiResponse<Review[]>>('/reviews/admin/all'),

  replyToReview: (id: number, data: ReplyReviewRequest) =>
    axiosInstance.put<ApiResponse<Review>>(`/reviews/${id}/reply`, data),

  updateReview: (id: number, data: UpdateReviewRequest) =>
    axiosInstance.put<ApiResponse<Review>>(`/reviews/${id}`, data)
};

export default reviewService;
