import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import type { Ticket } from "@/lib/models/Ticket"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "recent"

    const db = await getDatabase()

    // Build query based on user role
    const query: any = {}

    // End users can only see their own tickets
    if (user.role === "end_user") {
      query.createdBy = new ObjectId(user._id)
    }

    // Add filters
    if (status && status !== "all") {
      query.status = status
    }

    if (category && category !== "all") {
      // Find category by name
      const categoryDoc = await db.collection("categories").findOne({ name: category })
      if (categoryDoc) {
        query.category = categoryDoc._id
      }
    }

    if (search) {
      query.$or = [{ subject: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Build sort
    let sort: any = {}
    switch (sortBy) {
      case "priority":
        sort = { priority: -1, createdAt: -1 }
        break
      case "replies":
        // This would need a separate aggregation for comment count
        sort = { createdAt: -1 }
        break
      default:
        sort = { createdAt: -1 }
    }

    const tickets = await db
      .collection("tickets")
      .aggregate([
        { $match: query },
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
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "ticketId",
            as: "comments",
          },
        },
        {
          $addFields: {
            categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
            createdByName: { $arrayElemAt: ["$createdByInfo.name", 0] },
            assignedToName: { $arrayElemAt: ["$assignedToInfo.name", 0] },
            commentCount: { $size: "$comments" },
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
            comments: 0,
          },
        },
        { $sort: sort },
      ])
      .toArray()

    return NextResponse.json({ tickets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch tickets" }, { status: 500 })
  }
}

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
    const { subject, description, category, priority, attachments } = body

    if (!subject || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Find category by name
    const categoryDoc = await db.collection("categories").findOne({ name: category })
    if (!categoryDoc) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const newTicket: Omit<Ticket, "_id"> = {
      subject,
      description,
      category: categoryDoc._id!,
      status: "open",
      priority: priority || "medium",
      createdBy: new ObjectId(user._id),
      attachments: attachments || [],
      votes: {
        upvotes: [],
        downvotes: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Ticket>("tickets").insertOne(newTicket)

    // Fetch the created ticket with populated data
    const ticket = await db
      .collection("tickets")
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo",
          },
        },
        {
          $addFields: {
            categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
            upvoteCount: { $size: "$votes.upvotes" },
            downvoteCount: { $size: "$votes.downvotes" },
          },
        },
        {
          $project: {
            categoryInfo: 0,
          },
        },
      ])
      .toArray()

    return NextResponse.json({ ticket: ticket[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create ticket" }, { status: 500 })
  }
}
