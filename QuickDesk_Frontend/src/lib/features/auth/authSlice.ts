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
  initialized: boolean // Add this to track initialization
}

// Safe localStorage access for SSR
const getTokenFromStorage = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

const setTokenInStorage = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}

const removeTokenFromStorage = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
  initialized: false // Track if auth has been initialized
}

// API base URL - Fixed for Next.js
const API_BASE_URL = "http://localhost:5000/api"

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
      setTokenInStorage(data.token)

      return { user: data.user, token: data.token }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: { name: string; email: string; password: string; department?: string }, { rejectWithValue }) => {
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
      setTokenInStorage(data.token)

      return { user: data.user, token: data.token }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser", 
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState }
      let token = state.auth.token

      // If no token in state, try to get from localStorage
      if (!token) {
        token = getTokenFromStorage()
      }

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
        // If token is invalid, remove it
        if (response.status === 401) {
          removeTokenFromStorage()
        }
        return rejectWithValue(data.message || "Failed to get user")
      }

      return { user: data.user, token }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  }
)

// FIXED: Simplified initialization without circular dependency
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth", 
  async (_, { rejectWithValue }) => {
    try {
      const token = getTokenFromStorage()
      
      if (!token) {
        return { user: null, token: null, initialized: true }
      }

      // Directly fetch user data instead of dispatching getCurrentUser
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        removeTokenFromStorage()
        return { user: null, token: null, initialized: true }
      }

      const data = await response.json()
      return { user: data.user, token, initialized: true }
    } catch (error) {
      removeTokenFromStorage()
      return { user: null, token: null, initialized: true }
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.token = null
      removeTokenFromStorage()
    },
    clearError: (state) => {
      state.error = null
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    // Add this to manually set initialized state if needed
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload
    }
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
        state.user = action.payload.user
        if (action.payload.token) {
          state.token = action.payload.token
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        removeTokenFromStorage()
        // Only set error if it's not a "No token found" error
        if (action.payload !== "No token found") {
          state.error = action.payload as string
        }
      })

    // FIXED: Add missing initializeAuth cases
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        
        if (action.payload.user && action.payload.token) {
          state.isAuthenticated = true
          state.user = action.payload.user
          state.token = action.payload.token
        } else {
          state.isAuthenticated = false
          state.user = null
          state.token = null
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.initialized = true
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
  },
})

export const { logout, clearError, updateProfile, setToken, setInitialized } = authSlice.actions
export default authSlice.reducer