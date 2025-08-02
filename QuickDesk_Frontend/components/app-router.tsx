"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { LoginForm } from "./auth/login-form"
import { Dashboard } from "./dashboard/dashboard"

export function AppRouter() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <Dashboard />
}
