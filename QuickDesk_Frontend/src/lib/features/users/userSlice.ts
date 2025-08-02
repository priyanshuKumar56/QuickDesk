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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
})

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    params: { role?: string; status?: string; page?: number; limit?: number } = {},
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const queryParams = new URLSearchParams()
      if (params.role) queryParams.append("role", params.role)
      if (params.status) queryParams.append("status", params.status)
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())

      const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch users")
      }

      return data.users
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const updateUserAsync = createAsyncThunk(
  "users/updateUser",
  async ({ userId, updates }: { userId: string; updates: Partial<User> }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update user")
      }

      return data.user
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const deleteUserAsync = createAsyncThunk(
  "users/deleteUser",
  async (userId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        return rejectWithValue(data.message || "Failed to delete user")
      }

      return userId
    } catch (error: any) {
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
    // Keep legacy actions for backward compatibility
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
      state.loading = false
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload)
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload)
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
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
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update user
    builder
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Delete user
    builder
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload)
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError, setLoading, setUsers, addUser, updateUser, deleteUser, setError } = userSlice.actions

export default userSlice.reducer
