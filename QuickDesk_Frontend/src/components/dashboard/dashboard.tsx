"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { fetchTickets } from "@/lib/features/tickets/ticketSlice"
import { fetchUsers } from "@/lib/features/users/userSlice"
import { fetchRoleRequests, fetchUserRoleRequest } from "@/lib/features/roleRequests/roleRequestSlice"
import { getCurrentUser } from "@/lib/features/auth/authSlice"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { TicketList } from "@/components/tickets/ticket-list"
import { TicketDetail } from "@/components/tickets/ticket-detail"
import { CreateTicket } from "@/components/tickets/create-ticket"
import { UserManagement } from "@/components/admin/user-management"
import { RoleRequestsManagement } from "@/components/admin/role-requests-management"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth)
  const { currentTicket, loading: ticketsLoading, error: ticketsError } = useAppSelector((state) => state.tickets)
  const { loading: usersLoading, error: usersError } = useAppSelector((state) => state.users)
  const { loading: roleRequestsLoading, error: roleRequestsError } = useAppSelector((state) => state.roleRequests)
  const [activeView, setActiveView] = useState("dashboard")
  const [initialLoading, setInitialLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!isAuthenticated || !token) {
        return
      }

      try {
        // Get current user info first
        await dispatch(getCurrentUser()).unwrap()

        // Load initial data
        await Promise.all([
          dispatch(fetchTickets({ queue: "my-tickets" })).unwrap(),
          dispatch(fetchUsers()).unwrap(),
          dispatch(fetchRoleRequests()).unwrap(),
          dispatch(fetchUserRoleRequest()).unwrap(),
        ])
      } catch (error) {
        console.error("Failed to initialize dashboard:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    initializeDashboard()
  }, [dispatch, isAuthenticated, token])

  // Show loading spinner during initial load
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error if user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Authentication required. Please log in to access the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const renderContent = () => {
    // Show global errors
    const globalError = ticketsError || usersError || roleRequestsError
    if (globalError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{globalError}</AlertDescription>
        </Alert>
      )
    }

    switch (activeView) {
      case "dashboard":
        return currentTicket ? <TicketDetail /> : <TicketList />
      case "create-ticket":
        return <CreateTicket onClose={() => setActiveView("dashboard")} />
      case "users":
        return user?.role === "admin" ? <UserManagement /> : <TicketList />
      case "role-requests":
        return user?.role === "admin" ? <RoleRequestsManagement /> : <TicketList />
      case "profile":
        return <ProfileSettings />
      default:
        return <TicketList />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-professional transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <AppSidebar activeView={activeView} onViewChange={setActiveView} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader
          activeView={activeView}
          onViewChange={setActiveView}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-professional border border-gray-200 p-6 min-h-[calc(100vh-200px)]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
