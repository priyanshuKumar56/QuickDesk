import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { getCurrentUser } from '@/lib/features/auth/authSlice'
import AuthPage from '@/components/auth/auth-page'
import Dashboard from '@/components/dashboard/Dashboard'
import { Loader2 } from 'lucide-react'

export default function MainApp() {
    const dispatch = useAppDispatch()
    const { isAuthenticated, loading, token } = useAppSelector((state) => state.auth)

    useEffect(() => {
        // If we have a token but no user, try to get current user
        if (token && !isAuthenticated && !loading) {
            dispatch(getCurrentUser())
        }
    }, [dispatch, token, isAuthenticated, loading])

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <AuthPage />
    }

    return <Dashboard />
}
