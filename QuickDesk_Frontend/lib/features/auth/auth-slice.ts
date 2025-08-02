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
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// API calls
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    return data.user
  },
)

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({
    email,
    password,
    name,
    role,
  }: {
    email: string
    password: string
    name: string
    role: "end_user" | "support_agent"
  }) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    return data.user
  },
)

export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const response = await fetch("/api/auth/me")

  if (!response.ok) {
    throw new Error("Not authenticated")
  }

  const data = await response.json()
  return data.user
})

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await fetch("/api/auth/logout", { method: "POST" })
})

export const requestUpgrade = createAsyncThunk("auth/requestUpgrade", async ({ reason }: { reason?: string }) => {
  const response = await fetch("/api/users/upgrade-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to submit upgrade request")
  }

  return data
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Login failed"
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Registration failed"
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
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
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
