const mongoose = require("mongoose")
require("dotenv").config()

const User = require("../models/User")
const Ticket = require("../models/Ticket")
const RoleRequest = require("../models/RoleRequest")

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...")

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/quickdesk")
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Ticket.deleteMany({})
    await RoleRequest.deleteMany({})
    console.log("🧹 Cleared existing data")

    // Create users
    const users = [
      {
        name: "Admin User",
        email: "admin@quickdesk.com",
        password: "password123",
        role: "admin",
        department: "IT Support",
      },
      {
        name: "Support Agent",
        email: "agent@quickdesk.com",
        password: "password123",
        role: "agent",
        department: "IT Support",
      },
      {
        name: "End User",
        email: "user@quickdesk.com",
        password: "password123",
        role: "user",
        department: "Marketing",
      },
      {
        name: "John Doe",
        email: "john@quickdesk.com",
        password: "password123",
        role: "user",
        department: "Sales",
      },
      {
        name: "Sarah Wilson",
        email: "sarah@quickdesk.com",
        password: "password123",
        role: "agent",
        department: "IT Support",
      },
      {
        name: "Mike Johnson",
        email: "mike@quickdesk.com",
        password: "password123",
        role: "user",
        department: "Finance",
      },
    ]

    const createdUsers = await User.create(users)
    console.log(`👥 Created ${createdUsers.length} users`)

    // Create sample tickets
    const tickets = [
      {
        subject: "Email Authentication Issue",
        description:
          "Unable to access email account, authentication keeps failing. This has been happening since yesterday morning.",
        status: "in-progress",
        priority: "high",
        category: "Email & Communication",
        createdBy: createdUsers[2]._id, // End User
        assignedTo: createdUsers[1]._id, // Support Agent
        tags: ["email", "authentication", "urgent"],
        conversations: [
          {
            message:
              "Unable to access email account, authentication keeps failing. This has been happening since yesterday morning.",
            author: createdUsers[2]._id,
            authorName: "End User",
            authorRole: "user",
          },
          {
            message:
              "Thank you for contacting support. I will help you resolve this issue. Can you please try resetting your password?",
            author: createdUsers[1]._id,
            authorName: "Support Agent",
            authorRole: "agent",
          },
          {
            message: "I tried resetting the password but still getting the same error.",
            author: createdUsers[2]._id,
            authorName: "End User",
            authorRole: "user",
          },
        ],
        upvotes: [createdUsers[3]._id, createdUsers[4]._id],
      },
      {
        subject: "Software Installation Request",
        description:
          "Need Adobe Creative Suite installed on my workstation for the upcoming marketing campaign project.",
        status: "open",
        priority: "medium",
        category: "Software & Applications",
        createdBy: createdUsers[3]._id, // John Doe
        tags: ["software", "installation", "adobe"],
        conversations: [
          {
            message:
              "I need Adobe Creative Suite installed on my workstation for the upcoming marketing campaign project.",
            author: createdUsers[3]._id,
            authorName: "John Doe",
            authorRole: "user",
          },
        ],
        upvotes: [createdUsers[2]._id],
      },
      {
        subject: "Network Connectivity Problem",
        description: "Intermittent network disconnections in conference room B during important client meetings.",
        status: "resolved",
        priority: "low",
        category: "Network & Infrastructure",
        createdBy: createdUsers[2]._id, // End User
        assignedTo: createdUsers[4]._id, // Sarah Wilson
        tags: ["network", "infrastructure", "conference-room"],
        conversations: [
          {
            message:
              "The network in conference room B keeps disconnecting during meetings. This is affecting our client presentations.",
            author: createdUsers[2]._id,
            authorName: "End User",
            authorRole: "user",
          },
          {
            message:
              "I have checked the network equipment and replaced the faulty cable. The issue should be resolved now.",
            author: createdUsers[4]._id,
            authorName: "Sarah Wilson",
            authorRole: "agent",
          },
        ],
        upvotes: [createdUsers[1]._id, createdUsers[3]._id],
      },
      {
        subject: "Printer Not Working",
        description: "Office printer on 2nd floor is completely unresponsive and showing error messages.",
        status: "open",
        priority: "urgent",
        category: "Hardware & Equipment",
        createdBy: createdUsers[3]._id, // John Doe
        tags: ["printer", "hardware", "urgent"],
        conversations: [
          {
            message:
              "The printer on the 2nd floor is completely unresponsive. We have an important presentation to print for tomorrow's meeting.",
            author: createdUsers[3]._id,
            authorName: "John Doe",
            authorRole: "user",
          },
        ],
        upvotes: [createdUsers[2]._id, createdUsers[4]._id],
        downvotes: [],
      },
      {
        subject: "VPN Connection Issues",
        description: "Cannot connect to company VPN from home office, getting timeout errors consistently.",
        status: "open",
        priority: "high",
        category: "Network & Infrastructure",
        createdBy: createdUsers[5]._id, // Mike Johnson
        tags: ["vpn", "remote-work", "connection"],
        conversations: [
          {
            message:
              "I'm unable to connect to the company VPN from my home office. Getting connection timeout errors every time I try.",
            author: createdUsers[5]._id,
            authorName: "Mike Johnson",
            authorRole: "user",
          },
        ],
        upvotes: [createdUsers[3]._id],
      },
    ]

    const createdTickets = await Ticket.create(tickets)
    console.log(`🎫 Created ${createdTickets.length} tickets`)

    // Create sample role requests
    const roleRequests = [
      {
        userId: createdUsers[3]._id, // John Doe
        userName: "John Doe",
        userEmail: "john@quickdesk.com",
        currentRole: "user",
        requestedRole: "agent",
        reason:
          "I have extensive experience in IT support and would like to help resolve tickets for other users. I have been using the system for 6 months and understand the common issues that arise. I believe I can contribute effectively to the support team.",
        status: "pending",
      },
      {
        userId: createdUsers[5]._id, // Mike Johnson
        userName: "Mike Johnson",
        userEmail: "mike@quickdesk.com",
        currentRole: "user",
        requestedRole: "agent",
        reason:
          "As someone from the Finance department, I often deal with software and system issues. I would like to become an agent to help other users with similar problems and contribute to faster resolution times.",
        status: "pending",
      },
    ]

    await RoleRequest.create(roleRequests)
    console.log(`📋 Created ${roleRequests.length} role requests`)

    console.log("\n🎉 Seed data created successfully!")
    console.log("\n📧 Demo accounts created:")
    console.log("┌─────────────────────────────────────────┐")
    console.log("│  Role   │ Email                │ Password │")
    console.log("├─────────────────────────────────────────┤")
    console.log("│ Admin   │ admin@quickdesk.com  │ password123 │")
    console.log("│ Agent   │ agent@quickdesk.com  │ password123 │")
    console.log("│ Agent   │ sarah@quickdesk.com  │ password123 │")
    console.log("│ User    │ user@quickdesk.com   │ password123 │")
    console.log("│ User    │ john@quickdesk.com   │ password123 │")
    console.log("│ User    │ mike@quickdesk.com   │ password123 │")
    console.log("└─────────────────────────────────────────┘")
    console.log("\n🚀 You can now start the server with: npm run dev")

    process.exit(0)
  } catch (error) {
    console.error("❌ Seed error:", error)
    process.exit(1)
  }
}

// Run seeding
seedData()
