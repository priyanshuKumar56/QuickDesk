import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import type { User } from "./models/User"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    const db = await getDatabase()
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(decoded.userId) }, { projection: { password: 0 } })

    return user
  } catch (error) {
    console.error("Get user from token error:", error)
    return null
  }
}

export async function createUser(userData: {
  email: string
  password: string
  name: string
  role?: "end_user" | "support_agent"
}): Promise<User> {
  try {
    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.collection<User>("users").findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    const hashedPassword = await hashPassword(userData.password)

    const newUser: Omit<User, "_id"> = {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role || "end_user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<User>("users").insertOne(newUser)

    const user = await db.collection<User>("users").findOne({ _id: result.insertedId }, { projection: { password: 0 } })

    if (!user) throw new Error("Failed to create user")
    return user
  } catch (error) {
    console.error("Create user error:", error)
    throw error
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const db = await getDatabase()

    const user = await db.collection<User>("users").findOne({ email })
    if (!user || !user.isActive) return null

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) return null

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error("Authenticate user error:", error)
    return null
  }
}
