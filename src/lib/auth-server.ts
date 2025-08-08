import { createServerClient } from './supabase'

export async function getServerSession() {
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(requiredRole: string) {
  const session = await requireAuth()
  
  // Get user profile to check role
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== requiredRole) {
    throw new Error('Insufficient permissions')
  }

  return { session, profile }
}

export async function logSecurityEvent(event: string, userId?: string, details?: Record<string, unknown>) {
  console.log(`[SECURITY] ${new Date().toISOString()}: ${event}`, {
    userId,
    details,
    timestamp: new Date().toISOString()
  })
  
  // In production, you might want to send this to a logging service
  // like Sentry, LogRocket, or your own logging system
}
