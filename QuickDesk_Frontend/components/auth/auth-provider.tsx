"use client"

import type React from "react"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { checkAuth } from "@/lib/features/auth/auth-slice"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Check if user is authenticated on app load
    dispatch(checkAuth())
  }, [dispatch])

  return <>{children}</>
}
