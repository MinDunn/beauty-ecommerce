import axiosInstance from './axiosInstance';

export const feedbackService = {
  getAllFeedbacks: async () => {
    const response = await axiosInstance.get('/admin/contacts');
    return response.data.data; // ApiResponse<List<Feedback>>
  },
  deleteFeedback: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/contacts/${id}`);
    return response.data;
  },
  markAsRead: async (id: number) => {
    const response = await axiosInstance.patch(`/admin/contacts/${id}/read`);
    return response.data;
  }
};

export default feedbackService;
