"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchTickets } from "@/lib/features/tickets/tickets-slice"
import { fetchCategories } from "@/lib/features/categories/categories-slice"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TicketsDashboard } from "./tickets-dashboard"
import { CreateTicketForm } from "./create-ticket-form"
import { TicketDetail } from "./ticket-detail"
import { UserManagement } from "./user-management"
import { CategoryManagement } from "./category-management"
import { Analytics } from "./analytics"
import { Settings } from "./settings"
import { UpgradeRequests } from "./upgrade-requests"

interface DashboardContentProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function DashboardContent({ activeView, onViewChange }: DashboardContentProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(fetchTickets())
    dispatch(fetchCategories())
  }, [dispatch])

  const renderContent = () => {
    switch (activeView) {
      case "create-ticket":
        return <CreateTicketForm onBack={() => onViewChange("dashboard")} />
      case "ticket-detail":
        return <TicketDetail onBack={() => onViewChange("dashboard")} />
      case "users":
        return user?.role === "admin" || user?.role === "super_admin" ? (
          <UserManagement />
        ) : (
          <TicketsDashboard onCreateTicket={() => onViewChange("create-ticket")} />
        )
      case "categories":
        return user?.role === "admin" || user?.role === "super_admin" ? (
          <CategoryManagement />
        ) : (
          <TicketsDashboard onCreateTicket={() => onViewChange("create-ticket")} />
        )
      case "analytics":
        return user?.role === "admin" || user?.role === "super_admin" ? (
          <Analytics />
        ) : (
          <TicketsDashboard onCreateTicket={() => onViewChange("create-ticket")} />
        )
      case "upgrade-requests":
        return user?.role === "super_admin" ? (
          <UpgradeRequests />
        ) : (
          <TicketsDashboard onCreateTicket={() => onViewChange("create-ticket")} />
        )
      case "settings":
        return <Settings />
      default:
        return (
          <TicketsDashboard
            onCreateTicket={() => onViewChange("create-ticket")}
            onViewTicket={() => onViewChange("ticket-detail")}
          />
        )
    }
  }

  const getPageTitle = () => {
    switch (activeView) {
      case "create-ticket":
        return "Create Ticket"
      case "ticket-detail":
        return "Ticket Details"
      case "users":
        return "User Management"
      case "categories":
        return "Category Management"
      case "analytics":
        return "Analytics"
      case "upgrade-requests":
        return "Upgrade Requests"
      case "settings":
        return "Settings"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-white/20 backdrop-blur-xl bg-white/80 p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
    </div>
  )
}
