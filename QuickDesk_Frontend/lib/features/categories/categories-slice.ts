import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export interface Category {
  _id: string
  name: string
  description: string
  color: string
  createdAt: string
}

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
}

export const fetchCategories = createAsyncThunk("categories/fetchCategories", async () => {
  const response = await fetch("/api/categories")
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch categories")
  }

  return data.categories
})

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData: { name: string; description: string; color: string }) => {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create category")
    }

    return data.category
  },
)

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch categories"
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload)
      })
  },
})

export default categoriesSlice.reducer
