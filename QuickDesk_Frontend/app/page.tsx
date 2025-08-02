"use client"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AppRouter } from "@/components/app-router"
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <AppRouter />
          <Toaster />
        </div>
      </AuthProvider>
    </Provider>
  )
}
