"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { LoginForm } from "./auth/login-form"
import { Dashboard } from "./dashboard/dashboard"

export function AppRouter() {
  const { isAuthenticated, loading, initialized } = useSelector((state: RootState) => state.auth)

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <Dashboard />
}
