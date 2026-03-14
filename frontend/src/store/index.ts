import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Thêm các reducers ở đây (ví dụ: auth, cart)
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
