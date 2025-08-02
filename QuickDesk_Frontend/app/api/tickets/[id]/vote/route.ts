import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { voteType } = body // 'up' or 'down'

    if (!["up", "down"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(user._id)
    const ticketId = new ObjectId(params.id)

    // Get current ticket
    const ticket = await db.collection("tickets").findOne({ _id: ticketId })
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const currentUpvotes = ticket.votes?.upvotes || []
    const currentDownvotes = ticket.votes?.downvotes || []

    let newUpvotes = [...currentUpvotes]
    let newDownvotes = [...currentDownvotes]

    // Remove user from both arrays first
    newUpvotes = newUpvotes.filter((id) => !id.equals(userId))
    newDownvotes = newDownvotes.filter((id) => !id.equals(userId))

    // Check if user already voted this way
    const alreadyUpvoted = currentUpvotes.some((id) => id.equals(userId))
    const alreadyDownvoted = currentDownvotes.some((id) => id.equals(userId))

    if (voteType === "up") {
      if (!alreadyUpvoted) {
        newUpvotes.push(userId)
      }
    } else {
      if (!alreadyDownvoted) {
        newDownvotes.push(userId)
      }
    }

    // Update ticket
    await db.collection("tickets").updateOne(
      { _id: ticketId },
      {
        $set: {
          "votes.upvotes": newUpvotes,
          "votes.downvotes": newDownvotes,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      upvotes: newUpvotes.length,
      downvotes: newDownvotes.length,
      userVote:
        voteType === "up" && newUpvotes.some((id) => id.equals(userId))
          ? "up"
          : voteType === "down" && newDownvotes.some((id) => id.equals(userId))
            ? "down"
            : null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to vote on ticket" }, { status: 500 })
  }
}
