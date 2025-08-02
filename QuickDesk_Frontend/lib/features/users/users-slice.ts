import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { User } from "../auth/auth-slice"

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const mockUsers: User[] = [
    {
      id: "1",
      email: "admin@quickdesk.com",
      name: "Admin User",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      email: "agent@quickdesk.com",
      name: "Support Agent",
      role: "support_agent",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      email: "user@quickdesk.com",
      name: "End User",
      role: "end_user",
      createdAt: new Date().toISOString(),
    },
  ]

  return mockUsers
})

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch users"
      })
  },
})

export default usersSlice.reducer
