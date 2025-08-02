"use client"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { logoutUser } from "@/lib/features/auth/auth-slice"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Ticket, Plus, Users, Settings, HelpCircle, LogOut, BarChart3, Tags, Crown } from "lucide-react"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const getMenuItems = () => {
    const baseItems = [
      { title: "Dashboard", icon: Home, id: "dashboard" },
      { title: "My Tickets", icon: Ticket, id: "my-tickets" },
      { title: "Create Ticket", icon: Plus, id: "create-ticket" },
    ]

    if (user?.role === "support_agent" || user?.role === "admin" || user?.role === "super_admin") {
      baseItems.push({ title: "All Tickets", icon: Ticket, id: "all-tickets" })
    }

    if (user?.role === "admin" || user?.role === "super_admin") {
      baseItems.push(
        { title: "Users", icon: Users, id: "users" },
        { title: "Categories", icon: Tags, id: "categories" },
        { title: "Analytics", icon: BarChart3, id: "analytics" },
      )
    }

    if (user?.role === "super_admin") {
      baseItems.push({ title: "Upgrade Requests", icon: Crown, id: "upgrade-requests" })
    }

    baseItems.push({ title: "Settings", icon: Settings, id: "settings" })

    return baseItems
  }

  return (
    <Sidebar className="border-r border-white/20 backdrop-blur-xl bg-white/80">
      <SidebarHeader className="border-b border-white/20 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">QuickDesk</h2>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    className={`w-full justify-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeView === item.id ? "bg-blue-100 text-blue-700 border border-blue-200" : "hover:bg-white/60"
                    }`}
                    onClick={() => onViewChange(item.id)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900 hover:bg-white/60"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
