import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export interface Ticket {
  id: string
  subject: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  createdBy: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  attachments?: string[]
  conversations: Conversation[]
  upvotes: string[] // Array of user IDs who upvoted
  downvotes: string[] // Array of user IDs who downvoted
  tags?: string[]
}

export interface Conversation {
  id: string
  message: string
  author: string
  authorName: string
  authorRole: "admin" | "agent" | "user"
  timestamp: string
  attachments?: string[]
  isInternal?: boolean // For internal agent notes
}

interface TicketState {
  tickets: Ticket[]
  currentTicket: Ticket | null
  loading: boolean
  error: string | null
  filters: {
    status: string
    priority: string
    category: string
    search: string
    queue: "my-tickets" | "all-tickets" | "unassigned"
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  filters: {
    status: "all",
    priority: "all",
    category: "all",
    search: "",
    queue: "my-tickets",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
})

// Async thunks
export const fetchTickets = createAsyncThunk(
  "tickets/fetchTickets",
  async (
    params: { queue?: string; status?: string; priority?: string; page?: number; limit?: number },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const queryParams = new URLSearchParams()
      if (params.queue) queryParams.append("queue", params.queue)
      if (params.status && params.status !== "all") queryParams.append("status", params.status)
      if (params.priority && params.priority !== "all") queryParams.append("priority", params.priority)
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())

      const response = await fetch(`${API_BASE_URL}/tickets?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch tickets")
      }

      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const createTicket = createAsyncThunk(
  "tickets/createTicket",
  async (
    ticketData: { subject: string; description: string; priority: string; category: string; tags?: string[] },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(ticketData),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create ticket")
      }

      return data.ticket
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const updateTicketAsync = createAsyncThunk(
  "tickets/updateTicket",
  async ({ ticketId, updates }: { ticketId: string; updates: Partial<Ticket> }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update ticket")
      }

      return data.ticket
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const addConversationAsync = createAsyncThunk(
  "tickets/addConversation",
  async (
    { ticketId, message, isInternal }: { ticketId: string; message: string; isInternal?: boolean },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/conversations`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ message, isInternal }),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to add conversation")
      }

      return { ticketId, conversation: data.conversation }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const voteTicketAsync = createAsyncThunk(
  "tickets/voteTicket",
  async (
    { ticketId, voteType }: { ticketId: string; voteType: "upvote" | "downvote" },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as { auth: { token: string } }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue("No authentication token")
      }

      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/vote`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ voteType }),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to vote on ticket")
      }

      return data.ticket
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setCurrentTicket: (state, action: PayloadAction<Ticket | null>) => {
      state.currentTicket = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    // Keep legacy actions for backward compatibility
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload
      state.loading = false
    },
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.tickets.unshift(action.payload)
    },
    updateTicket: (state, action: PayloadAction<Ticket>) => {
      const index = state.tickets.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.tickets[index] = action.payload
      }
      if (state.currentTicket?.id === action.payload.id) {
        state.currentTicket = action.payload
      }
    },
    addConversation: (state, action: PayloadAction<{ ticketId: string; conversation: Conversation }>) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId)
      if (ticket) {
        ticket.conversations.push(action.payload.conversation)
        ticket.updatedAt = new Date().toISOString()
      }
      if (state.currentTicket?.id === action.payload.ticketId) {
        state.currentTicket.conversations.push(action.payload.conversation)
        state.currentTicket.updatedAt = new Date().toISOString()
      }
    },
    voteTicket: (
      state,
      action: PayloadAction<{ ticketId: string; userId: string; voteType: "upvote" | "downvote" }>,
    ) => {
      const { ticketId, userId, voteType } = action.payload
      const ticket = state.tickets.find((t) => t.id === ticketId)

      if (ticket) {
        ticket.upvotes = ticket.upvotes.filter((id) => id !== userId)
        ticket.downvotes = ticket.downvotes.filter((id) => id !== userId)

        if (voteType === "upvote") {
          ticket.upvotes.push(userId)
        } else {
          ticket.downvotes.push(userId)
        }
      }

      if (state.currentTicket?.id === ticketId) {
        state.currentTicket.upvotes = state.currentTicket.upvotes.filter((id) => id !== userId)
        state.currentTicket.downvotes = state.currentTicket.downvotes.filter((id) => id !== userId)

        if (voteType === "upvote") {
          state.currentTicket.upvotes.push(userId)
        } else {
          state.currentTicket.downvotes.push(userId)
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tickets
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload.tickets
        state.pagination.total = action.payload.total
        state.pagination.page = action.payload.page
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create ticket
    builder
      .addCase(createTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false
        state.tickets.unshift(action.payload)
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update ticket
    builder.addCase(updateTicketAsync.fulfilled, (state, action) => {
      const index = state.tickets.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.tickets[index] = action.payload
      }
      if (state.currentTicket?.id === action.payload.id) {
        state.currentTicket = action.payload
      }
    })

    // Add conversation
    builder.addCase(addConversationAsync.fulfilled, (state, action) => {
      const { ticketId, conversation } = action.payload
      const ticket = state.tickets.find((t) => t.id === ticketId)
      if (ticket) {
        ticket.conversations.push(conversation)
        ticket.updatedAt = new Date().toISOString()
      }
      if (state.currentTicket?.id === ticketId) {
        state.currentTicket.conversations.push(conversation)
        state.currentTicket.updatedAt = new Date().toISOString()
      }
    })

    // Vote ticket
    builder.addCase(voteTicketAsync.fulfilled, (state, action) => {
      const updatedTicket = action.payload
      const index = state.tickets.findIndex((t) => t.id === updatedTicket.id)
      if (index !== -1) {
        state.tickets[index] = updatedTicket
      }
      if (state.currentTicket?.id === updatedTicket.id) {
        state.currentTicket = updatedTicket
      }
    })
  },
})

export const {
  setCurrentTicket,
  setFilters,
  setPagination,
  clearError,
  setLoading,
  setTickets,
  addTicket,
  updateTicket,
  addConversation,
  voteTicket,
} = ticketSlice.actions

export default ticketSlice.reducer
