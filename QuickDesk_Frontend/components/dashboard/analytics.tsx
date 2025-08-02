"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, AlertTriangle } from "lucide-react"

export function Analytics() {
  const { tickets } = useSelector((state: RootState) => state.tickets)
  const { categories } = useSelector((state: RootState) => state.categories)
  const { users } = useSelector((state: RootState) => state.users)

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === "open").length,
    inProgressTickets: tickets.filter((t) => t.status === "in_progress").length,
    resolvedTickets: tickets.filter((t) => t.status === "resolved").length,
    closedTickets: tickets.filter((t) => t.status === "closed").length,
    totalUsers: users.length,
    totalCategories: categories.length,
  }

  const categoryStats = categories.map((category) => ({
    name: category.name,
    count: tickets.filter((t) => t.category === category.name).length,
    color: category.color,
  }))

  const priorityStats = [
    { name: "Urgent", count: tickets.filter((t) => t.priority === "urgent").length, color: "#ef4444" },
    { name: "High", count: tickets.filter((t) => t.priority === "high").length, color: "#f97316" },
    { name: "Medium", count: tickets.filter((t) => t.priority === "medium").length, color: "#f59e0b" },
    { name: "Low", count: tickets.filter((t) => t.priority === "low").length, color: "#22c55e" },
  ]

  const resolutionRate =
    stats.totalTickets > 0 ? Math.round(((stats.resolvedTickets + stats.closedTickets) / stats.totalTickets) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="backdrop-blur-xl bg-white/80 border-white/20 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/50">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-white/20 bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openTickets}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/50">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-white/20 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-gray-900">{resolutionRate}%</p>
              </div>
              <div className="p-2 rounded-lg bg-white/50">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-white/20 bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/50">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Status */}
        <Card className="backdrop-blur-xl bg-white/80 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tickets by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-600">Open</span>
                <span className="text-sm font-bold">{stats.openTickets}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${stats.totalTickets > 0 ? (stats.openTickets / stats.totalTickets) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">In Progress</span>
                <span className="text-sm font-bold">{stats.inProgressTickets}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${stats.totalTickets > 0 ? (stats.inProgressTickets / stats.totalTickets) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">Resolved</span>
                <span className="text-sm font-bold">{stats.resolvedTickets}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${stats.totalTickets > 0 ? (stats.resolvedTickets / stats.totalTickets) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Closed</span>
                <span className="text-sm font-bold">{stats.closedTickets}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: `${stats.totalTickets > 0 ? (stats.closedTickets / stats.totalTickets) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets by Category */}
        <Card className="backdrop-blur-xl bg-white/80 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tickets by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm font-bold">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: category.color,
                        width: `${stats.totalTickets > 0 ? (category.count / stats.totalTickets) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {priorityStats.map((priority) => (
              <div key={priority.name} className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: priority.color }}
                >
                  {priority.count}
                </div>
                <p className="text-sm font-medium text-gray-900">{priority.name}</p>
                <p className="text-xs text-gray-500">
                  {stats.totalTickets > 0 ? Math.round((priority.count / stats.totalTickets) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
