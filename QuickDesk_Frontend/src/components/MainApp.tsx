import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initializeAuth } from '@/lib/features/auth/authSlice'
import AuthPage from '@/components/auth/auth-page'
import Dashboard from '@/components/dashboard/dashboard'
import { Loader2 } from 'lucide-react'

export default function MainApp() {
    const dispatch = useAppDispatch()
    const { isAuthenticated, loading, initialized } = useAppSelector((state) => state.auth)

    useEffect(() => {
        // Initialize auth on app start
        if (!initialized) {
            dispatch(initializeAuth())
        }
    }, [dispatch, initialized])

    // Show loading spinner while initializing authentication
    if (!initialized || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Initializing...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <AuthPage />
    }

    return <Dashboard />
}