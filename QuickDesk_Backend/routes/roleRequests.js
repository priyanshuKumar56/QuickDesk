const express = require("express");
const { body, validationResult } = require("express-validator");
const RoleRequest = require("../models/RoleRequest");
const User = require("../models/User");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Get all role requests (Admin only)
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;

    const requests = await RoleRequest.find(filter)
      .populate("userId", "name email avatar")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RoleRequest.countDocuments(filter);

    const formattedRequests = requests.map((request) => ({
      id: request._id,
      userId: request.userId._id,
      userName: request.userId.name,
      userEmail: request.userId.email,
      currentRole: request.currentRole,
      requestedRole: request.requestedRole,
      reason: request.reason,
      status: request.status,
      createdAt: request.createdAt,
      reviewedAt: request.reviewedAt,
      reviewedBy: request.reviewedBy?._id,
      adminComment: request.adminComment,
    }));

    res.json({
      requests: formattedRequests,
      total,
      page: Number.parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get role requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's own role request
router.get("/my-request", auth, async (req, res) => {
  try {
    const request = await RoleRequest.findOne({
      userId: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "No pending role request found" });
    }

    res.json({
      request: {
        id: request._id,
        userId: request.userId,
        userName: req.user.name,
        userEmail: req.user.email,
        currentRole: request.currentRole,
        requestedRole: request.requestedRole,
        reason: request.reason,
        status: request.status,
        createdAt: request.createdAt,
        reviewedAt: request.reviewedAt,
        reviewedBy: request.reviewedBy,
        adminComment: request.adminComment,
      },
    });
  } catch (error) {
    console.error("Get user role request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create role request
router.post(
  "/",
  auth,
  [
    body("requestedRole")
      .isIn(["agent", "admin"])
      .withMessage("Requested role must be agent or admin"),
    body("reason")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Reason must be at least 10 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { requestedRole, reason } = req.body;

      // Check if user already has a pending request
      const existingRequest = await RoleRequest.findOne({
        userId: req.user._id,
        status: "pending",
      });

      if (existingRequest) {
        return res
          .status(400)
          .json({ message: "You already have a pending role request" });
      }

      // Check if user is trying to request same role they already have
      if (req.user.role === requestedRole) {
        return res
          .status(400)
          .json({ message: `You already have the ${requestedRole} role` });
      }

      // Check role hierarchy (users can request agent, agents can request admin)
      if (req.user.role === "user" && requestedRole === "admin") {
        return res.status(400).json({
          message:
            "Users must first become agents before requesting admin role",
        });
      }

      const roleRequest = new RoleRequest({
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        currentRole: req.user.role,
        requestedRole,
        reason,
      });

      await roleRequest.save();

      res.status(201).json({
        message: "Role request submitted successfully",
        request: {
          id: roleRequest._id,
          userId: roleRequest.userId,
          userName: roleRequest.userName,
          userEmail: roleRequest.userEmail,
          currentRole: roleRequest.currentRole,
          requestedRole: roleRequest.requestedRole,
          reason: roleRequest.reason,
          status: roleRequest.status,
          createdAt: roleRequest.createdAt,
        },
      });
    } catch (error) {
      console.error("Create role request error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Review role request (Admin only) - FIXED ROUTE
router.put(
  "/:requestId/review",
  auth,
  adminOnly,
  [
    body("status")
      .isIn(["approved", "rejected"])
      .withMessage("Status must be approved or rejected"),
    body("adminComment").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { requestId } = req.params;
      const { status, adminComment } = req.body;

      const roleRequest = await RoleRequest.findById(requestId).populate(
        "userId"
      );
      if (!roleRequest) {
        return res.status(404).json({ message: "Role request not found" });
      }

      if (roleRequest.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Role request has already been reviewed" });
      }

      // Update role request
      roleRequest.status = status;
      roleRequest.reviewedBy = req.user._id;
      roleRequest.reviewedAt = new Date();
      if (adminComment) roleRequest.adminComment = adminComment;

      await roleRequest.save();

      // If approved, update user's role
      if (status === "approved") {
        await User.findByIdAndUpdate(roleRequest.userId._id, {
          role: roleRequest.requestedRole,
        });
      }

      res.json({
        message: `Role request ${status} successfully`,
        request: {
          id: roleRequest._id,
          userId: roleRequest.userId._id,
          userName: roleRequest.userName,
          userEmail: roleRequest.userEmail,
          currentRole: roleRequest.currentRole,
          requestedRole: roleRequest.requestedRole,
          reason: roleRequest.reason,
          status: roleRequest.status,
          createdAt: roleRequest.createdAt,
          reviewedAt: roleRequest.reviewedAt,
          reviewedBy: roleRequest.reviewedBy,
          adminComment: roleRequest.adminComment,
        },
      });
    } catch (error) {
      console.error("Review role request error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
