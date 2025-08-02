import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [
    { id: '1', name: 'Technical Support', description: 'Technical issues and troubleshooting', color: '#3b82f6', isActive: true },
    { id: '2', name: 'Billing', description: 'Billing and payment related queries', color: '#10b981', isActive: true },
    { id: '3', name: 'General Inquiry', description: 'General questions and information', color: '#8b5cf6', isActive: true },
    { id: '4', name: 'Feature Request', description: 'New feature suggestions', color: '#f59e0b', isActive: true },
    { id: '5', name: 'Bug Report', description: 'Report bugs and issues', color: '#ef4444', isActive: true },
  ],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
  },
});

export const { setCategories, addCategory, updateCategory, deleteCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;