import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { User } from "../auth/authSlice"

interface UserState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
}

// FIXED: Consistent API URL
const API_BASE_URL = (typeof window !== 'undefined' && import.meta?.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : "http://localhost:5000/api"

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
})

// Helper function to validate token and auth state
const validateAuth = (state: any) => {
  const authState = state.auth
  if (!authState?.token || !authState?.isAuthenticated || !authState?.user) {
    throw new Error("No valid authentication token")
  }
  return authState.token
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    params: { role?: string; status?: string; page?: number; limit?: number } = {},
    { rejectWithValue, getState },
  ) => {
    try {
      const token = validateAuth(getState())

      const queryParams = new URLSearchParams()
      if (params.role) queryParams.append("role", params.role)
      if (params.status) queryParams.append("status", params.status)
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())

      const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Authentication expired")
        }
        return rejectWithValue(data.message || "Failed to fetch users")
      }

      return data.users || []
    } catch (error: any) {
      if (error.message === "No valid authentication token") {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ userId, updates }: { userId: string; updates: Partial<User> }, { rejectWithValue, getState }) => {
    try {
      const token = validateAuth(getState())

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Authentication expired")
        }
        return rejectWithValue(data.message || "Failed to update user")
      }

      return data.user
    } catch (error: any) {
      if (error.message === "No valid authentication token") {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId: string, { rejectWithValue, getState }) => {
    try {
      const token = validateAuth(getState())

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 401) {
          return rejectWithValue("Authentication expired")
        }
        return rejectWithValue(data.message || "Failed to delete user")
      }

      return userId
    } catch (error: any) {
      if (error.message === "No valid authentication token") {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(error.message || "Network error")
    }
  },
)

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    // FIXED: Remove legacy actions that could cause state inconsistencies
    resetState: (state) => {
      state.users = []
      state.loading = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        // Clear users on auth error
        if (action.payload === "Authentication expired" || action.payload === "No valid authentication token") {
          state.users = []
        }
      })

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload)
        state.error = null
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError, resetState } = userSlice.actions
export default userSlice.reducer