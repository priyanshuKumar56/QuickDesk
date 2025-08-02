import type { ObjectId } from "mongodb"

export interface Ticket {
  _id?: ObjectId
  subject: string
  description: string
  category: ObjectId
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdBy: ObjectId
  assignedTo?: ObjectId
  attachments?: string[]
  votes: {
    upvotes: ObjectId[]
    downvotes: ObjectId[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id?: ObjectId
  ticketId: ObjectId
  content: string
  author: ObjectId
  isInternal: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateTicketInput {
  subject: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  attachments?: string[]
}

export interface UpdateTicketInput {
  subject?: string
  description?: string
  category?: string
  status?: "open" | "in_progress" | "resolved" | "closed"
  priority?: "low" | "medium" | "high" | "urgent"
  assignedTo?: string
}
