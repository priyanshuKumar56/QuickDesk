import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "agent" | "user"
  avatar?: string
  department?: string
  isActive: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  token: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: localStorage.getItem("token"),
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed")
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token)

      return { user: data.user, token: data.token }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: { name: string; email: string; password: string; department: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Registration failed")
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token)

      return { user: data.user, token: data.token }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: AuthState }
    const token = state.auth.token

    if (!token) {
      return rejectWithValue("No token found")
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to get user")
    }

    return data.user
  } catch (error: any) {
    return rejectWithValue(error.message || "Network error")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.token = null
      localStorage.removeItem("token")
    },
    clearError: (state) => {
      state.error = null
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem("token")
      })
  },
})

export const { logout, clearError, updateProfile } = authSlice.actions
export default authSlice.reducer
