import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export interface RoleRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  currentRole: "user" | "agent" | "admin"
  requestedRole: "agent" | "admin"
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
  adminComment?: string
}

interface RoleRequestState {
  requests: RoleRequest[]
  userRequest: RoleRequest | null
  loading: boolean
  error: string | null
}

const initialState: RoleRequestState = {
  requests: [],
  userRequest: null,
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
export const fetchRoleRequests = createAsyncThunk(
  "roleRequests/fetchRoleRequests",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = validateAuth(getState())

      const response = await fetch(`${API_BASE_URL}/role-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle 401 specifically
        if (response.status === 401) {
          return rejectWithValue("Authentication expired")
        }
        return rejectWithValue(data.message || "Failed to fetch role requests")
      }

      return data.requests || []
    } catch (error: any) {
      if (error.message === "No valid authentication token") {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const createRoleRequest = createAsyncThunk(
  "roleRequests/createRoleRequest",
  async (
    { requestedRole, reason }: { requestedRole: "agent" | "admin"; reason: string },
    { rejectWithValue, getState },
  ) => {
    try {
      const token = validateAuth(getState())

      const response = await fetch(`${API_BASE_URL}/role-requests`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ requestedRole, reason }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Authentication expired")
        }
        return rejectWithValue(data.message || "Failed to create role request")
      }

      return data.request
    } catch (error: any) {
      if (error.message === "No valid authentication token") {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const reviewRoleRequest = createAsyncThunk(
  "roleRequests/reviewRoleRequest",
  async (
    { requestId, status, adminComment }: { requestId: string; status: "approved" | "rejected"; adminComment?: string },
    { rejectWithValue, getState },
  ) => {
    try {
      const token = validateAuth(getState())

      const response = await fetch(`${API_BASE_URL}/role-requests/${requestId}/review`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status, adminComment }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Authentication expired")
        }
        return rejectWithValue(data.message || "Failed to review role request")
      }

      return data.request
    } catch (error: any) {
      if (error.message === "No valid authentication token") {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const fetchUserRoleRequest = createAsyncThunk(
  "roleRequests/fetchUserRoleRequest",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = validateAuth(getState())

      const response = await fetch(`${API_BASE_URL}/role-requests/my-request`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        return null // No request found - this is normal
      }

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue("Authentication expired")
        }
        return rejectWithValue(data.message || "Failed to fetch user role request")
      }

      return data.request
    } catch (error: any) {
      if (error.message === "No valid authentication token") {
        return rejectWithValue(error.message)
      }
      return rejectWithValue(error.message || "Network error")
    }
  },
)

const roleRequestSlice = createSlice({
  name: "roleRequests",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    // FIXED: Remove legacy actions that could cause state inconsistencies
    resetState: (state) => {
      state.requests = []
      state.userRequest = null
      state.loading = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch role requests
    builder
      .addCase(fetchRoleRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRoleRequests.fulfilled, (state, action) => {
        state.loading = false
        state.requests = action.payload
        state.error = null
      })
      .addCase(fetchRoleRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        // Clear requests on auth error
        if (action.payload === "Authentication expired" || action.payload === "No valid authentication token") {
          state.requests = []
        }
      })

    // Create role request
    builder
      .addCase(createRoleRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRoleRequest.fulfilled, (state, action) => {
        state.loading = false
        state.requests.unshift(action.payload)
        state.userRequest = action.payload
        state.error = null
      })
      .addCase(createRoleRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Review role request
    builder
      .addCase(reviewRoleRequest.pending, (state) => {
        state.error = null
      })
      .addCase(reviewRoleRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex((r) => r.id === action.payload.id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
        if (state.userRequest?.id === action.payload.id) {
          state.userRequest = action.payload
        }
        state.error = null
      })
      .addCase(reviewRoleRequest.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Fetch user role request
    builder
      .addCase(fetchUserRoleRequest.pending, (state) => {
        state.error = null
      })
      .addCase(fetchUserRoleRequest.fulfilled, (state, action) => {
        state.userRequest = action.payload
        state.error = null
      })
      .addCase(fetchUserRoleRequest.rejected, (state, action) => {
        state.error = action.payload as string
        // Clear user request on auth error
        if (action.payload === "Authentication expired" || action.payload === "No valid authentication token") {
          state.userRequest = null
        }
      })
  },
})

export const { clearError, resetState } = roleRequestSlice.actions
export default roleRequestSlice.reducer