import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import type { Category } from "@/lib/models/Category"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Create default categories if none exist
    const count = await db.collection<Category>("categories").countDocuments()
    if (count === 0) {
      const defaultCategories = [
        {
          name: "Technical",
          description: "Technical issues and bugs",
          color: "#ef4444",
          isActive: true,
          createdBy: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Feature Request",
          description: "New feature requests",
          color: "#3b82f6",
          isActive: true,
          createdBy: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Account",
          description: "Account related issues",
          color: "#10b981",
          isActive: true,
          createdBy: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Billing",
          description: "Billing and payment issues",
          color: "#f59e0b",
          isActive: true,
          createdBy: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      await db.collection<Category>("categories").insertMany(defaultCategories)
    }

    const categories = await db.collection<Category>("categories").find({ isActive: true }).toArray()

    return NextResponse.json({ categories })
  } catch (error: any) {
    console.error("Fetch categories error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, color } = body

    if (!name || !description || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if category already exists
    const existingCategory = await db.collection<Category>("categories").findOne({ name })
    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const newCategory: Omit<Category, "_id"> = {
      name,
      description,
      color,
      isActive: true,
      createdBy: new ObjectId(user._id),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Category>("categories").insertOne(newCategory)
    const category = await db.collection<Category>("categories").findOne({ _id: result.insertedId })

    return NextResponse.json({ category })
  } catch (error: any) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 })
  }
}
