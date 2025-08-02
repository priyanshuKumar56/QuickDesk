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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
})

// Async thunks
export const fetchRoleRequests = createAsyncThunk(
  "roleRequests/fetchRoleRequests",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/role-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch role requests")
      }

      return data.requests
    } catch (error: any) {
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
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/role-requests`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ requestedRole, reason }),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create role request")
      }

      return data.request
    } catch (error: any) {
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
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/role-requests/${requestId}/review`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status, adminComment }),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to review role request")
      }

      return data.request
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const fetchUserRoleRequest = createAsyncThunk(
  "roleRequests/fetchUserRoleRequest",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/role-requests/my-request`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          return null // No request found
        }
        return rejectWithValue(data.message || "Failed to fetch user role request")
      }

      return data.request
    } catch (error: any) {
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
    // Keep legacy actions for backward compatibility
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setRequests: (state, action: PayloadAction<RoleRequest[]>) => {
      state.requests = action.payload
      state.loading = false
    },
    addRequest: (state, action: PayloadAction<RoleRequest>) => {
      state.requests.unshift(action.payload)
      if (action.payload.userId === state.userRequest?.userId) {
        state.userRequest = action.payload
      }
    },
    updateRequest: (state, action: PayloadAction<RoleRequest>) => {
      const index = state.requests.findIndex((r) => r.id === action.payload.id)
      if (index !== -1) {
        state.requests[index] = action.payload
      }
      if (state.userRequest?.id === action.payload.id) {
        state.userRequest = action.payload
      }
    },
    setUserRequest: (state, action: PayloadAction<RoleRequest | null>) => {
      state.userRequest = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
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
      })
      .addCase(fetchRoleRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
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
      })
      .addCase(createRoleRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Review role request
    builder
      .addCase(reviewRoleRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex((r) => r.id === action.payload.id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
        if (state.userRequest?.id === action.payload.id) {
          state.userRequest = action.payload
        }
      })
      .addCase(reviewRoleRequest.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Fetch user role request
    builder.addCase(fetchUserRoleRequest.fulfilled, (state, action) => {
      state.userRequest = action.payload
    })
  },
})

export const { clearError, setLoading, setRequests, addRequest, updateRequest, setUserRequest, setError } =
  roleRequestSlice.actions

export default roleRequestSlice.reducer
