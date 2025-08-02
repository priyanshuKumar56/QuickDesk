import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  categoryId: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  conversations: Conversation[];
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

export interface Conversation {
  id: string;
  message: string;
  author: string;
  authorName: string;
  createdAt: string;
  isInternal: boolean;
  attachments?: string[];
}

interface TicketsState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    priority: string;
    category: string;
    search: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: TicketsState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    category: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
      state.loading = false;
    },
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.tickets.unshift(action.payload);
    },
    updateTicket: (state, action: PayloadAction<Ticket>) => {
      const index = state.tickets.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
      if (state.currentTicket?.id === action.payload.id) {
        state.currentTicket = action.payload;
      }
    },
    setCurrentTicket: (state, action: PayloadAction<Ticket | null>) => {
      state.currentTicket = action.payload;
    },
    addConversation: (state, action: PayloadAction<{ ticketId: string; conversation: Conversation }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.conversations.push(action.payload.conversation);
      }
      if (state.currentTicket?.id === action.payload.ticketId) {
        state.currentTicket.conversations.push(action.payload.conversation);
      }
    },
    setFilters: (state, action: PayloadAction<Partial<TicketsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<TicketsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    voteTicket: (state, action: PayloadAction<{ ticketId: string; voteType: 'up' | 'down' }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        const { voteType } = action.payload;
        const currentVote = ticket.userVote;
        
        // Remove previous vote
        if (currentVote === 'up') ticket.upvotes--;
        if (currentVote === 'down') ticket.downvotes--;
        
        // Add new vote or toggle off
        if (currentVote === voteType) {
          ticket.userVote = null;
        } else {
          ticket.userVote = voteType;
          if (voteType === 'up') ticket.upvotes++;
          if (voteType === 'down') ticket.downvotes++;
        }
      }
      
      if (state.currentTicket?.id === action.payload.ticketId) {
        const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
        if (ticket) state.currentTicket = ticket;
      }
    },
    assignTicket: (state, action: PayloadAction<{ ticketId: string; agentId: string }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.assignedTo = action.payload.agentId;
        ticket.updatedAt = new Date().toISOString();
      }
      if (state.currentTicket?.id === action.payload.ticketId) {
        state.currentTicket.assignedTo = action.payload.agentId;
        state.currentTicket.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  setLoading,
  setTickets,
  addTicket,
  updateTicket,
  setCurrentTicket,
  addConversation,
  setFilters,
  setPagination,
  setError,
  voteTicket,
  assignTicket,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;