"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Ticket, Plus, Users, Settings, LogOut, HelpCircle, BarChart3, UserPlus } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { logout } from "@/lib/features/auth/authSlice"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { requests } = useAppSelector((state) => state.roleRequests)

  const handleLogout = () => {
    dispatch(logout())
  }

  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      id: "dashboard",
      roles: ["admin", "agent", "user"],
    },
    {
      title: "Create Ticket",
      icon: Plus,
      id: "create-ticket",
      roles: ["user"],
    },
    {
      title: "All Tickets",
      icon: Ticket,
      id: "dashboard",
      roles: ["admin", "agent"],
    },
    {
      title: "Analytics",
      icon: BarChart3,
      id: "analytics",
      roles: ["admin", "agent"],
    },
    {
      title: "User Management",
      icon: Users,
      id: "users",
      roles: ["admin"],
    },
    {
      title: "Role Requests",
      icon: UserPlus,
      id: "role-requests",
      roles: ["admin"],
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role || "user"))

  return (
    <Sidebar className="bg-white border-r border-gray-200 shadow-professional">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">QuickDesk</h2>
            <p className="text-sm text-gray-500">Help Desk</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-medium">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start hover:bg-gray-100 data-[active=true]:bg-primary data-[active=true]:text-white relative"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-medium">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange("profile")}
                  isActive={activeView === "profile"}
                  className="hover:bg-gray-100 data-[active=true]:bg-primary data-[active=true]:text-white"
                >
                  <Settings className="h-4 w-4" />
                  <span>Profile & Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback className="bg-primary text-white">{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start border-gray-300 hover:bg-gray-50 bg-transparent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
