import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export interface Ticket {
  _id: string
  subject: string
  description: string
  categoryName: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdBy: string
  createdByName: string
  assignedTo?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
  attachments?: string[]
  comments?: Comment[]
  upvoteCount: number
  downvoteCount: number
  userVote?: "up" | "down"
  commentCount?: number
}

export interface Comment {
  _id: string
  content: string
  author: string
  authorName: string
  createdAt: string
  isInternal?: boolean
}

interface TicketsState {
  tickets: Ticket[]
  currentTicket: Ticket | null
  loading: boolean
  error: string | null
  filters: {
    status: string
    category: string
    search: string
    sortBy: "recent" | "priority" | "replies"
  }
}

const initialState: TicketsState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  filters: {
    status: "all",
    category: "all",
    search: "",
    sortBy: "recent",
  },
}

export const fetchTickets = createAsyncThunk("tickets/fetchTickets", async (_, { getState }) => {
  const state = getState() as any
  const { filters } = state.tickets

  const params = new URLSearchParams()
  if (filters.status !== "all") params.append("status", filters.status)
  if (filters.category !== "all") params.append("category", filters.category)
  if (filters.search) params.append("search", filters.search)
  if (filters.sortBy) params.append("sortBy", filters.sortBy)

  const response = await fetch(`/api/tickets?${params.toString()}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch tickets")
  }

  return data.tickets
})

export const fetchTicketById = createAsyncThunk("tickets/fetchTicketById", async (ticketId: string) => {
  const response = await fetch(`/api/tickets/${ticketId}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch ticket")
  }

  return data.ticket
})

export const createTicket = createAsyncThunk(
  "tickets/createTicket",
  async (ticketData: {
    subject: string
    description: string
    category: string
    priority: "low" | "medium" | "high" | "urgent"
    attachments?: string[]
  }) => {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create ticket")
    }

    return data.ticket
  },
)

export const updateTicketStatus = createAsyncThunk(
  "tickets/updateStatus",
  async ({
    ticketId,
    status,
    assignedTo,
    priority,
  }: {
    ticketId: string
    status?: string
    assignedTo?: string
    priority?: string
  }) => {
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, assignedTo, priority }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to update ticket")
    }

    return { ticketId, status, assignedTo, priority }
  },
)

export const addComment = createAsyncThunk(
  "tickets/addComment",
  async ({
    ticketId,
    content,
    isInternal,
  }: {
    ticketId: string
    content: string
    isInternal?: boolean
  }) => {
    const response = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, isInternal }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to add comment")
    }

    return { ticketId, comment: data.comment }
  },
)

export const voteTicket = createAsyncThunk(
  "tickets/voteTicket",
  async ({ ticketId, voteType }: { ticketId: string; voteType: "up" | "down" }) => {
    const response = await fetch(`/api/tickets/${ticketId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to vote on ticket")
    }

    return { ticketId, ...data }
  },
)

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TicketsState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setCurrentTicket: (state, action: PayloadAction<Ticket | null>) => {
      state.currentTicket = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch tickets"
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.currentTicket = action.payload
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.tickets.unshift(action.payload)
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        const ticket = state.tickets.find((t) => t._id === action.payload.ticketId)
        if (ticket) {
          if (action.payload.status) ticket.status = action.payload.status as any
          if (action.payload.priority) ticket.priority = action.payload.priority as any
          ticket.updatedAt = new Date().toISOString()
        }
        if (state.currentTicket?._id === action.payload.ticketId) {
          if (action.payload.status) state.currentTicket.status = action.payload.status as any
          if (action.payload.priority) state.currentTicket.priority = action.payload.priority as any
          state.currentTicket.updatedAt = new Date().toISOString()
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const ticket = state.tickets.find((t) => t._id === action.payload.ticketId)
        if (ticket) {
          ticket.updatedAt = new Date().toISOString()
        }
        if (state.currentTicket?._id === action.payload.ticketId) {
          if (!state.currentTicket.comments) state.currentTicket.comments = []
          state.currentTicket.comments.push(action.payload.comment)
          state.currentTicket.updatedAt = new Date().toISOString()
        }
      })
      .addCase(voteTicket.fulfilled, (state, action) => {
        const ticket = state.tickets.find((t) => t._id === action.payload.ticketId)
        if (ticket) {
          ticket.upvoteCount = action.payload.upvotes
          ticket.downvoteCount = action.payload.downvotes
          ticket.userVote = action.payload.userVote
        }
        if (state.currentTicket?._id === action.payload.ticketId) {
          state.currentTicket.upvoteCount = action.payload.upvotes
          state.currentTicket.downvoteCount = action.payload.downvotes
          state.currentTicket.userVote = action.payload.userVote
        }
      })
  },
})

export const { setFilters, setCurrentTicket, clearError } = ticketsSlice.actions
export default ticketsSlice.reducer
