import type { ObjectId } from "mongodb"

export interface Category {
  _id?: ObjectId
  name: string
  description: string
  color: string
  isActive: boolean
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryInput {
  name: string
  description: string
  color: string
}
