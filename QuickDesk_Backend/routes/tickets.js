const express = require("express")
const { body, validationResult } = require("express-validator")
const Ticket = require("../models/Ticket")
const User = require("../models/User")
const { auth, agentOrAdmin } = require("../middleware/auth")

const router = express.Router()

// Get tickets
router.get("/", auth, async (req, res) => {
  try {
    const { queue, status, priority, category, search, page = 1, limit = 20 } = req.query

    const filter = {}

    // Apply queue filter
    if (queue === "my-tickets") {
      filter.assignedTo = req.user._id
    } else if (queue === "unassigned") {
      filter.assignedTo = { $exists: false }
    }

    // For regular users, only show their own tickets
    if (req.user.role === "user") {
      filter.createdBy = req.user._id
    }

    // Apply other filters
    if (status && status !== "all") filter.status = status
    if (priority && priority !== "all") filter.priority = priority
    if (category && category !== "all") filter.category = category
    if (search) {
      filter.$text = { $search: search }
    }

    const tickets = await Ticket.find(filter)
      .populate("createdBy", "name email avatar")
      .populate("assignedTo", "name email avatar")
      .populate("conversations.author", "name email avatar role")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Ticket.countDocuments(filter)

    // Format tickets for frontend
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket._id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdBy: ticket.createdBy._id,
      assignedTo: ticket.assignedTo?._id,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      attachments: ticket.attachments,
      upvotes: ticket.upvotes,
      downvotes: ticket.downvotes,
      tags: ticket.tags,
      conversations: ticket.conversations.map((conv) => ({
        id: conv._id,
        message: conv.message,
        author: conv.author._id,
        authorName: conv.author.name,
        authorRole: conv.author.role,
        timestamp: conv.createdAt,
        isInternal: conv.isInternal,
        attachments: conv.attachments,
      })),
    }))

    res.json({
      tickets: formattedTickets,
      total,
      page: Number.parseInt(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get tickets error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single ticket
router.get("/:id", auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("assignedTo", "name email avatar")
      .populate("conversations.author", "name email avatar role")

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check permissions
    const canView =
      req.user.role === "admin" ||
      req.user.role === "agent" ||
      ticket.createdBy._id.toString() === req.user._id.toString()

    if (!canView) {
      return res.status(403).json({ message: "Not authorized to view this ticket" })
    }

    res.json({ ticket })
  } catch (error) {
    console.error("Get ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create ticket
router.post(
  "/",
  auth,
  [
    body("subject").trim().isLength({ min: 5 }).withMessage("Subject must be at least 5 characters"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("priority").isIn(["low", "medium", "high", "urgent"]),
    body("category").trim().isLength({ min: 1 }).withMessage("Category is required"),
    body("tags").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { subject, description, priority, category, tags } = req.body

      const ticket = new Ticket({
        subject,
        description,
        priority,
        category,
        tags: tags || [],
        createdBy: req.user._id,
        conversations: [
          {
            message: description,
            author: req.user._id,
            authorName: req.user.name,
            authorRole: req.user.role,
          },
        ],
      })

      await ticket.save()
      await ticket.populate("createdBy", "name email avatar")

      res.status(201).json({
        message: "Ticket created successfully",
        ticket: {
          id: ticket._id,
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category,
          createdBy: ticket.createdBy._id,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          attachments: ticket.attachments,
          upvotes: ticket.upvotes,
          downvotes: ticket.downvotes,
          tags: ticket.tags,
          conversations: ticket.conversations.map((conv) => ({
            id: conv._id,
            message: conv.message,
            author: conv.author,
            authorName: req.user.name,
            authorRole: req.user.role,
            timestamp: conv.createdAt,
            isInternal: conv.isInternal,
            attachments: conv.attachments,
          })),
        },
      })
    } catch (error) {
      console.error("Create ticket error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update ticket
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    // Check permissions
    const canUpdate =
      req.user.role === "admin" || req.user.role === "agent" || ticket.createdBy.toString() === req.user._id.toString()

    if (!canUpdate) {
      return res.status(403).json({ message: "Not authorized to update this ticket" })
    }

    // Update ticket
    Object.assign(ticket, updates)
    await ticket.save()

    await ticket.populate("createdBy", "name email avatar")
    await ticket.populate("assignedTo", "name email avatar")

    res.json({
      message: "Ticket updated successfully",
      ticket: {
        id: ticket._id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdBy: ticket.createdBy._id,
        assignedTo: ticket.assignedTo?._id,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        attachments: ticket.attachments,
        upvotes: ticket.upvotes,
        downvotes: ticket.downvotes,
        tags: ticket.tags,
        conversations: ticket.conversations,
      },
    })
  } catch (error) {
    console.error("Update ticket error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add conversation
router.post(
  "/:id/conversations",
  auth,
  [
    body("message").trim().isLength({ min: 1 }).withMessage("Message is required"),
    body("isInternal").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { id } = req.params
      const { message, isInternal = false } = req.body

      const ticket = await Ticket.findById(id)
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" })
      }

      // Check permissions
      const canReply =
        req.user.role === "admin" ||
        req.user.role === "agent" ||
        ticket.createdBy.toString() === req.user._id.toString()

      if (!canReply) {
        return res.status(403).json({ message: "Not authorized to reply to this ticket" })
      }

      // Only agents and admins can create internal notes
      const finalIsInternal = isInternal && ["agent", "admin"].includes(req.user.role)

      const conversation = {
        message,
        author: req.user._id,
        authorName: req.user.name,
        authorRole: req.user.role,
        isInternal: finalIsInternal,
      }

      ticket.conversations.push(conversation)
      await ticket.save()

      const newConversation = ticket.conversations[ticket.conversations.length - 1]

      res.json({
        message: "Reply added successfully",
        conversation: {
          id: newConversation._id,
          message: newConversation.message,
          author: newConversation.author,
          authorName: newConversation.authorName,
          authorRole: newConversation.authorRole,
          timestamp: newConversation.createdAt,
          isInternal: newConversation.isInternal,
          attachments: newConversation.attachments,
        },
      })
    } catch (error) {
      console.error("Add conversation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Vote on ticket
router.post(
  "/:id/vote",
  auth,
  [body("voteType").isIn(["upvote", "downvote"]).withMessage("Vote type must be upvote or downvote")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { id } = req.params
      const { voteType } = req.body

      const ticket = await Ticket.findById(id)
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" })
      }

      // Remove user from both arrays first
      ticket.upvotes = ticket.upvotes.filter((userId) => userId.toString() !== req.user._id.toString())
      ticket.downvotes = ticket.downvotes.filter((userId) => userId.toString() !== req.user._id.toString())

      // Add to appropriate array
      if (voteType === "upvote") {
        ticket.upvotes.push(req.user._id)
      } else {
        ticket.downvotes.push(req.user._id)
      }

      await ticket.save()

      res.json({
        message: `Ticket ${voteType}d successfully`,
        ticket: {
          id: ticket._id,
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category,
          createdBy: ticket.createdBy,
          assignedTo: ticket.assignedTo,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          attachments: ticket.attachments,
          upvotes: ticket.upvotes,
          downvotes: ticket.downvotes,
          tags: ticket.tags,
          conversations: ticket.conversations,
        },
      })
    } catch (error) {
      console.error("Vote ticket error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
