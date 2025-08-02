const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth, adminOnly } = require("../middleware/auth")

const router = express.Router()

// Get all users (Admin only)
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const { role, status, page = 1, limit = 50, search } = req.query

    const filter = {}
    if (role && role !== "all") filter.role = role
    if (status === "active") filter.isActive = true
    if (status === "inactive") filter.isActive = false
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ]
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(filter)

    res.json({
      users,
      total,
      page: Number.parseInt(page),
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user by ID (Admin only)
router.get("/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user (Admin only)
router.put(
  "/:id",
  auth,
  adminOnly,
  [
    body("name").optional().trim().isLength({ min: 2 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("role").optional().isIn(["user", "agent", "admin"]),
    body("department").optional().trim(),
    body("isActive").optional().isBoolean(),
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
      const updates = req.body

      // Don't allow updating password through this route
      delete updates.password

      const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("-password")

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      res.json({
        message: "User updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
          isActive: user.isActive,
        },
      })
    } catch (error) {
      console.error("Update user error:", error)
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email already exists" })
      }
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete user (Admin only)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params

    // Don't allow admin to delete themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" })
    }

    const user = await User.findByIdAndDelete(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
