'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'employee' | 'guest'
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (requiredRole && userProfile?.role !== requiredRole) {
        // Check if user has sufficient permissions
        const roleHierarchy = {
          'guest': 0,
          'employee': 1,
          'manager': 2,
          'admin': 3
        }

        const userLevel = roleHierarchy[userProfile?.role as keyof typeof roleHierarchy] || 0
        const requiredLevel = roleHierarchy[requiredRole]

        if (userLevel < requiredLevel) {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [user, userProfile, loading, requiredRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
