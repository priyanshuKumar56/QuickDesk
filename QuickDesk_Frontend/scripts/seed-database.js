const { MongoClient, ObjectId } = require("mongodb")

const uri = "mongodb://localhost:27017"
const dbName = "quickdesk"

async function seedDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)

    // Clear existing data
    await db.collection("users").deleteMany({})
    await db.collection("categories").deleteMany({})
    await db.collection("tickets").deleteMany({})
    await db.collection("comments").deleteMany({})

    console.log("Cleared existing data")

    // Create super admin user
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash("password", 12)

    const superAdmin = {
      email: "superadmin@quickdesk.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "super_admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const adminResult = await db.collection("users").insertOne(superAdmin)
    console.log("Created super admin user")

    // Create default categories
    const categories = [
      {
        name: "Technical",
        description: "Technical issues and bugs",
        color: "#ef4444",
        isActive: true,
        createdBy: adminResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Feature Request",
        description: "New feature requests",
        color: "#3b82f6",
        isActive: true,
        createdBy: adminResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Account",
        description: "Account related issues",
        color: "#10b981",
        isActive: true,
        createdBy: adminResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Billing",
        description: "Billing and payment issues",
        color: "#f59e0b",
        isActive: true,
        createdBy: adminResult.insertedId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("categories").insertMany(categories)
    console.log("Created default categories")

    // Create sample users
    const users = [
      {
        email: "admin@quickdesk.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "agent@quickdesk.com",
        password: hashedPassword,
        name: "Support Agent",
        role: "support_agent",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user@quickdesk.com",
        password: hashedPassword,
        name: "End User",
        role: "end_user",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("users").insertMany(users)
    console.log("Created sample users")

    console.log("Database seeded successfully!")
    console.log("Login credentials:")
    console.log("Super Admin: superadmin@quickdesk.com / password")
    console.log("Admin: admin@quickdesk.com / password")
    console.log("Agent: agent@quickdesk.com / password")
    console.log("User: user@quickdesk.com / password")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
