"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { DashboardContent } from "./dashboard-content"

export function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard")

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-hidden">
          <DashboardContent activeView={activeView} onViewChange={setActiveView} />
        </main>
      </div>
    </SidebarProvider>
  )
}
