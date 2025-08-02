"use client"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AppRouter } from "@/components/app-router"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
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
