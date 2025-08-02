import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export interface User {
  id: string
  email: string
  name: string
  role: "end_user" | "support_agent" | "admin" | "super_admin"
  avatar?: string
  createdAt: string
  upgradeRequest?: {
    requestedRole: "admin"
    requestedAt: string
    status: "pending" | "approved" | "rejected"
    reviewedBy?: string
    reviewedAt?: string
    reason?: string
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false,
}

// API calls
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || "Login failed")
      }

      return data.user
    } catch (error) {
      return rejectWithValue("Network error occurred")
    }
  },
)

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      password,
      name,
      role,
    }: {
      email: string
      password: string
      name: string
      role: "end_user" | "support_agent"
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || "Registration failed")
      }

      return data.user
    } catch (error) {
      return rejectWithValue("Network error occurred")
    }
  },
)

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/auth/me")

    if (!response.ok) {
      return rejectWithValue("Not authenticated")
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    return rejectWithValue("Network error occurred")
  }
})

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await fetch("/api/auth/logout", { method: "POST" })
})

export const requestUpgrade = createAsyncThunk(
  "auth/requestUpgrade",
  async ({ reason }: { reason?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/users/upgrade-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to submit upgrade request")
      }

      return data
    } catch (error) {
      return rejectWithValue("Network error occurred")
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setInitialized: (state) => {
      state.initialized = true
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.initialized = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.initialized = true
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.initialized = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.initialized = true
      })
      .addCase(checkAuth.pending, (state) => {
        if (!state.initialized) {
          state.loading = true
        }
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.loading = false
        state.initialized = true
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.initialized = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
        state.initialized = true
      })
      .addCase(requestUpgrade.fulfilled, (state) => {
        if (state.user) {
          state.user.upgradeRequest = {
            requestedRole: "admin",
            requestedAt: new Date().toISOString(),
            status: "pending",
            reason: "User requested admin privileges",
          }
        }
      })
      .addCase(requestUpgrade.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError, setInitialized } = authSlice.actions
export default authSlice.reducer
