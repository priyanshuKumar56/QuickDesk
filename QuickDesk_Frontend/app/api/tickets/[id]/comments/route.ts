import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import type { Comment } from "@/lib/models/Ticket"
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
    const { content, isInternal } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const ticketId = new ObjectId(params.id)

    // Check if ticket exists
    const ticket = await db.collection("tickets").findOne({ _id: ticketId })
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Check permissions - end users can only comment on their own tickets
    if (user.role === "end_user" && ticket.createdBy.toString() !== user._id!.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const newComment: Omit<Comment, "_id"> = {
      ticketId,
      content,
      author: new ObjectId(user._id),
      isInternal: isInternal || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Comment>("comments").insertOne(newComment)

    // Update ticket's updatedAt
    await db.collection("tickets").updateOne({ _id: ticketId }, { $set: { updatedAt: new Date() } })

    // Get the comment with author info
    const comment = await db
      .collection("comments")
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $addFields: {
            authorName: { $arrayElemAt: ["$authorInfo.name", 0] },
          },
        },
        {
          $project: {
            authorInfo: 0,
          },
        },
      ])
      .toArray()

    return NextResponse.json({ comment: comment[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add comment" }, { status: 500 })
  }
}
