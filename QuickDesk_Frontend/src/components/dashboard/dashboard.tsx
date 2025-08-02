"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
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
  const { user, token, isAuthenticated, initialized } = useAppSelector((state) => state.auth)
  const { currentTicket, loading: ticketsLoading, error: ticketsError } = useAppSelector((state) => state.tickets)
  const { loading: usersLoading, error: usersError } = useAppSelector((state) => state.users)
  const { loading: roleRequestsLoading, error: roleRequestsError } = useAppSelector((state) => state.roleRequests)
  const [activeView, setActiveView] = useState("dashboard")
  const [initialLoading, setInitialLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [initializationError, setInitializationError] = useState<string | null>(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      // Only initialize if authenticated and initialized, and not already loading
      if (!isAuthenticated || !initialized || !token || !user || initialLoading === false) {
        return
      }

      try {
        setInitializationError(null)

        // Always fetch user's tickets and their own role request
        const basePromises = [
          dispatch(fetchTickets({ queue: "my-tickets" })).unwrap(),
          dispatch(fetchUserRoleRequest()).unwrap().catch((error) => {
            // 404 is normal if user has no role request
            if (!error.includes('404') && !error.includes('Not Found')) {
              throw error
            }
            return null
          })
        ]

        // Role-based data fetching
        const roleBasedPromises = []

        if (user.role === "admin") {
          // Admins can fetch all users and role requests
          roleBasedPromises.push(
            dispatch(fetchUsers()).unwrap(),
            dispatch(fetchRoleRequests()).unwrap()
          )
        } else if (user.role === "agent") {
          // Agents might be able to fetch users (depends on your backend)
          // Try to fetch users, but don't fail if forbidden
          roleBasedPromises.push(
            dispatch(fetchUsers()).unwrap().catch((error) => {
              if (error.includes('403') || error.includes('Access denied')) {
                console.log('Agent cannot access users - this is normal')
                return null
              }
              throw error
            })
          )
        }
        // Regular users don't need additional data beyond their tickets and role request

        // Execute all promises
        await Promise.all([...basePromises, ...roleBasedPromises])

      } catch (error: any) {
        console.error("Failed to initialize dashboard:", error)
        setInitializationError(error.message || 'Failed to load dashboard data')
      } finally {
        setInitialLoading(false)
      }
    }

    initializeDashboard()
  }, [dispatch, isAuthenticated, initialized, token, user, initialLoading])

  // Show loading spinner during initial load or auth initialization
  if (!initialized || initialLoading) {
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
    // Show initialization error with retry option
    if (initializationError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {initializationError}
            <button
              onClick={() => {
                setInitializationError(null)
                setInitialLoading(true)
              }}
              className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      )
    }

    // Filter errors based on user role - don't show 403 errors for features user can't access
    const relevantErrors = []

    // Always show ticket errors
    if (ticketsError && !ticketsError.includes('403')) {
      relevantErrors.push(ticketsError)
    }

    // Only show user/role request errors for admins
    if (user.role === 'admin') {
      if (usersError && !usersError.includes('403')) {
        relevantErrors.push(usersError)
      }
      if (roleRequestsError && !roleRequestsError.includes('403')) {
        relevantErrors.push(roleRequestsError)
      }
    }

    // Show relevant errors
    if (relevantErrors.length > 0) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {relevantErrors.join(', ')}
          </AlertDescription>
        </Alert>
      )
    }

    switch (activeView) {
      case "dashboard":
        return currentTicket ? <TicketDetail /> : <TicketList />
      case "create-ticket":
        return <CreateTicket onClose={() => setActiveView("dashboard")} />
      case "users":
        if (user?.role !== "admin") {
          return (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You don't have permission to access user management. Admin privileges required.
              </AlertDescription>
            </Alert>
          )
        }
        return <UserManagement />
      case "role-requests":
        if (user?.role !== "admin") {
          return (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You don't have permission to access role requests. Admin privileges required.
              </AlertDescription>
            </Alert>
          )
        }
        return <RoleRequestsManagement />
      case "profile":
        return <ProfileSettings />
      default:
        return <TicketList />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AppSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onClose={() => setSidebarOpen(false)}
          userRole={user?.role} // Pass user role to sidebar to conditionally show admin options
        />

        {/* Main content */}
        <SidebarInset className="flex-1">
          <DashboardHeader
            activeView={activeView}
            onViewChange={setActiveView}
            onMenuClick={() => setSidebarOpen(true)}
            userRole={user?.role} // Pass user role to header
          />
          <main className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-professional border border-gray-200 p-6 min-h-[calc(100vh-200px)]">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}