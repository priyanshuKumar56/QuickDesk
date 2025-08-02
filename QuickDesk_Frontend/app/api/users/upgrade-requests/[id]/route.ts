import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { action } = body // 'approve' or 'reject'

    const db = await getDatabase()

    const updateData: any = {
      "upgradeRequest.status": action === "approve" ? "approved" : "rejected",
      "upgradeRequest.reviewedBy": new ObjectId(user._id),
      "upgradeRequest.reviewedAt": new Date(),
      updatedAt: new Date(),
    }

    // If approved, also update the user role
    if (action === "approve") {
      updateData.role = "admin"
    }

    await db.collection("users").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    return NextResponse.json({
      message: `Upgrade request ${action === "approve" ? "approved" : "rejected"} successfully`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process upgrade request" }, { status: 500 })
  }
}
