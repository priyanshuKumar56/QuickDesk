import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()

    const ticket = await db
      .collection("tickets")
      .aggregate([
        { $match: { _id: new ObjectId(params.id) } },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdByInfo",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedToInfo",
          },
        },
        {
          $addFields: {
            categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
            createdByName: { $arrayElemAt: ["$createdByInfo.name", 0] },
            assignedToName: { $arrayElemAt: ["$assignedToInfo.name", 0] },
            upvoteCount: { $size: "$votes.upvotes" },
            downvoteCount: { $size: "$votes.downvotes" },
            userVote: {
              $cond: {
                if: { $in: [new ObjectId(user._id), "$votes.upvotes"] },
                then: "up",
                else: {
                  $cond: {
                    if: { $in: [new ObjectId(user._id), "$votes.downvotes"] },
                    then: "down",
                    else: null,
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            categoryInfo: 0,
            createdByInfo: 0,
            assignedToInfo: 0,
          },
        },
      ])
      .toArray()

    if (!ticket[0]) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Check permissions - end users can only see their own tickets
    if (user.role === "end_user" && ticket[0].createdBy.toString() !== user._id!.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get comments
    const comments = await db
      .collection("comments")
      .aggregate([
        { $match: { ticketId: new ObjectId(params.id) } },
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
        { $sort: { createdAt: 1 } },
      ])
      .toArray()

    return NextResponse.json({
      ticket: { ...ticket[0], comments },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch ticket" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { status, assignedTo, priority } = body

    const db = await getDatabase()

    // Check if ticket exists and user has permission
    const ticket = await db.collection("tickets").findOne({ _id: new ObjectId(params.id) })
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Only support agents and admins can update ticket status
    if (user.role === "end_user") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const updateData: any = { updatedAt: new Date() }

    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (assignedTo) updateData.assignedTo = new ObjectId(assignedTo)

    await db.collection("tickets").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    return NextResponse.json({ message: "Ticket updated successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update ticket" }, { status: 500 })
  }
}
