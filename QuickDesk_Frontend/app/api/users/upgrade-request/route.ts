import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { reason } = body

    const db = await getDatabase()

    // Check if user already has a pending request
    if (user.upgradeRequest?.status === "pending") {
      return NextResponse.json({ error: "You already have a pending upgrade request" }, { status: 400 })
    }

    // Update user with upgrade request
    await db.collection("users").updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          upgradeRequest: {
            requestedRole: "admin",
            requestedAt: new Date(),
            status: "pending",
            reason: reason || "User requested admin privileges",
          },
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Upgrade request submitted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit upgrade request" }, { status: 500 })
  }
}
