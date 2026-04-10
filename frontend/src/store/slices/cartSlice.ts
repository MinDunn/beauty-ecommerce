import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

const getSafeJSON = (key: string, defaultValue: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : JSON.parse(defaultValue);
  } catch {
    return JSON.parse(defaultValue);
  }
};

const initialState: CartState = {
  items: getSafeJSON('cartItems', '[]'),
  totalQuantity: getSafeJSON('totalQuantity', '0'),
  totalAmount: getSafeJSON('totalAmount', '0'),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);
      
      state.totalQuantity += newItem.quantity;
      state.totalAmount += newItem.price * newItem.quantity;

      if (!existingItem) {
        state.items.push(newItem);
      } else {
        existingItem.quantity += newItem.quantity;
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      localStorage.setItem('totalQuantity', JSON.stringify(state.totalQuantity));
      localStorage.setItem('totalAmount', JSON.stringify(state.totalAmount));
    },
    
    removeItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => item.id !== id);
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      localStorage.setItem('totalQuantity', JSON.stringify(state.totalQuantity));
      localStorage.setItem('totalAmount', JSON.stringify(state.totalAmount));
    },

    updateQuantity(state, action: PayloadAction<{ id: string; delta: number }>) {
      const { id, delta } = action.payload;
      const item = state.items.find((item) => item.id === id);

      if (item) {
        if (item.quantity + delta > 0) {
          item.quantity += delta;
          state.totalQuantity += delta;
          state.totalAmount += item.price * delta;
        }
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      localStorage.setItem('totalQuantity', JSON.stringify(state.totalQuantity));
      localStorage.setItem('totalAmount', JSON.stringify(state.totalAmount));
    },

    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('totalQuantity');
      localStorage.removeItem('totalAmount');
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
