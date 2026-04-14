import axiosInstance from './axiosInstance';

export interface CartItemRequest {
  productId: number;
  quantity: number;
  variantName?: string | null;
}

export const cartService = {
  getCart: async () => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },
  addToCart: async (data: CartItemRequest) => {
    const response = await axiosInstance.post('/cart', data);
    return response.data;
  },
  updateQuantity: async (data: CartItemRequest) => {
    const response = await axiosInstance.put('/cart', data);
    return response.data;
  },
  removeFromCart: async (productId: number, variantName?: string | null) => {
    const response = await axiosInstance.delete(`/cart/${productId}`, {
      params: { variantName }
    });
    return response.data;
  }
};

export default cartService;
