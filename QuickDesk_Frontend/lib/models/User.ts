import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  role: "end_user" | "support_agent" | "admin" | "super_admin"
  avatar?: string
  isActive: boolean
  upgradeRequest?: {
    requestedRole: "admin"
    requestedAt: Date
    status: "pending" | "approved" | "rejected"
    reviewedBy?: ObjectId
    reviewedAt?: Date
    reason?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  password: string
  name: string
  role?: "end_user" | "support_agent"
}

export interface LoginInput {
  email: string
  password: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: "end_user" | "support_agent" | "admin"
  isActive?: boolean
}
