const mongoose = require("mongoose")

const roleRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    currentRole: {
      type: String,
      enum: ["user", "agent", "admin"],
      required: true,
    },
    requestedRole: {
      type: String,
      enum: ["agent", "admin"],
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      minlength: [10, "Reason must be at least 10 characters"],
      maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    adminComment: {
      type: String,
      trim: true,
      maxlength: [500, "Admin comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Ensure one pending request per user
roleRequestSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  },
)

module.exports = mongoose.model("RoleRequest", roleRequestSchema)
