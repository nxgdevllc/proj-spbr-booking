'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getCurrentUser, hasPermission, User } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: User['user_role']
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'employee',
  fallback 
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated()) {
        router.push('/login')
        return
      }

      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      if (!hasPermission(currentUser, requiredRole)) {
        if (fallback) {
          setUser(currentUser)
        } else {
          router.push('/unauthorized')
        }
        return
      }

      setUser(currentUser)
    }
    setLoading(false)
  }, [router, requiredRole, fallback])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!hasPermission(user, requiredRole)) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
