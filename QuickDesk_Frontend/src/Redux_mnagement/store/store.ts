import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import ticketsSlice from './slices/ticketsSlice';
import categoriesSlice from './slices/categoriesSlice';
import notificationsSlice from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tickets: ticketsSlice,
    categories: categoriesSlice,
    notifications: notificationsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;