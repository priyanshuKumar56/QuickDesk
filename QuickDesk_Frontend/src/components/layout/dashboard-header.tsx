"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Plus } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"

interface DashboardHeaderProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function DashboardHeader({ activeView, onViewChange }: DashboardHeaderProps) {
  const { user } = useAppSelector((state) => state.auth)
  const { tickets } = useAppSelector((state) => state.tickets)

  const getPageTitle = () => {
    switch (activeView) {
      case "dashboard":
        if (user?.role === "agent" || user?.role === "admin") {
          return "Agent Dashboard"
        }
        return "Dashboard"
      case "create-ticket":
        return "Create New Ticket"
      case "users":
        return "User Management"
      case "role-requests":
        return "Role Requests"
      case "profile":
        return "Profile & Settings"
      default:
        return "Dashboard"
    }
  }

  const openTicketsCount = tickets.filter((t) => t.status === "open").length
  const myTicketsCount = tickets.filter((t) => t.assignedTo === user?.id).length

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-professional">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="border-gray-300 hover:bg-gray-50" />

        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
          {(user?.role === "agent" || user?.role === "admin") && activeView === "dashboard" && (
            <p className="text-sm text-gray-600">
              {myTicketsCount} assigned to you • {openTicketsCount} open tickets
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user?.role === "user" && activeView === "dashboard" && (
            <Button onClick={() => onViewChange("create-ticket")} size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              className="pl-10 w-64 border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>

          <Button variant="outline" size="sm" className="relative border-gray-300 hover:bg-gray-50 bg-transparent">
            <Bell className="h-4 w-4" />
            {openTicketsCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                {openTicketsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
