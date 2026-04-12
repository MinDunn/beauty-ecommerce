import axiosInstance from './axiosInstance';

export const feedbackService = {
  getAllFeedbacks: async () => {
    const response = await axiosInstance.get('/admin/contacts');
    return response.data.data; // ApiResponse<List<Feedback>>
  }
};

export default feedbackService;
