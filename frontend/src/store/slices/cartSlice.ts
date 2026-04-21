import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  quantity: number;
  variantName?: string | null;
  selected?: boolean;
  categoryId?: number;
  stockQuantity?: number;
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
      const existingItem = state.items.find(
        (item) => item.id === newItem.id && item.variantName === newItem.variantName
      );
      
      state.totalQuantity += newItem.quantity;
      state.totalAmount += newItem.price * newItem.quantity;

      if (!existingItem) {
        state.items.push({ ...newItem, selected: true });
      } else {
        existingItem.quantity += newItem.quantity;
        existingItem.selected = true; // Auto select if added again
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      localStorage.setItem('totalQuantity', JSON.stringify(state.totalQuantity));
      localStorage.setItem('totalAmount', JSON.stringify(state.totalAmount));
    },
    
    removeItem(state, action: PayloadAction<{ id: string; variantName?: string | null }>) {
      const { id, variantName } = action.payload;
      const existingItem = state.items.find(
        (item) => item.id === id && item.variantName === variantName
      );

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter(
          (item) => !(item.id === id && item.variantName === variantName)
        );
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
      localStorage.setItem('totalQuantity', JSON.stringify(state.totalQuantity));
      localStorage.setItem('totalAmount', JSON.stringify(state.totalAmount));
    },

    updateQuantity(state, action: PayloadAction<{ id: string; variantName?: string | null; delta: number }>) {
      const { id, variantName, delta } = action.payload;
      const item = state.items.find(
        (item) => item.id === id && item.variantName === variantName
      );

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

    clearSelectedItems(state) {
        state.items = state.items.filter(item => !item.selected);
        // Recalculate totals
        state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        localStorage.setItem('totalQuantity', JSON.stringify(state.totalQuantity));
        localStorage.setItem('totalAmount', JSON.stringify(state.totalAmount));
    },

    toggleItemSelection(state, action: PayloadAction<{ id: string; variantName?: string | null }>) {
      const { id, variantName } = action.payload;
      const item = state.items.find(i => i.id === id && i.variantName === variantName);
      if (item) {
        item.selected = !item.selected;
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    toggleAllSelection(state, action: PayloadAction<boolean>) {
      state.items.forEach(item => {
        item.selected = action.payload;
      });
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    selectOnlyItems(state, action: PayloadAction<{ id: string; variantName?: string | null }[]>) {
      state.items.forEach(item => {
        const isTarget = action.payload.find(p => p.id === item.id && p.variantName === item.variantName);
        item.selected = !!isTarget;
      });
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
  },
});

export const { 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart, 
  clearSelectedItems,
  toggleItemSelection, 
  toggleAllSelection, 
  selectOnlyItems 
} = cartSlice.actions;
export default cartSlice.reducer;
