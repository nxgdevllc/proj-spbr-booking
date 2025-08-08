import { supabase } from './supabase'
import { createHash } from 'crypto'

export interface User {
  id: number
  employee_name: string
  employee_role: string
  user_role: 'employee' | 'manager' | 'stakeholder' | 'admin'
  username: string
  email: string
  status: string
}

export interface LoginCredentials {
  username: string
  password: string
}

// Hash password using SHA-256 (in production, use bcrypt or similar)
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// Login function
export async function loginUser(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { username, password } = credentials
    const hashedPassword = hashPassword(password)

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('username', username)
      .eq('password_hash', hashedPassword)
      .eq('status', 'Active')
      .single()

    if (error || !data) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Update last login
    await supabase
      .from('employees')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id)

    const user: User = {
      id: data.id,
      employee_name: data.employee_name,
      employee_role: data.employee_role,
      user_role: data.user_role,
      username: data.username,
      email: data.email,
      status: data.status
    }

    // Store user in session storage
    sessionStorage.setItem('user', JSON.stringify(user))
    sessionStorage.setItem('isAuthenticated', 'true')

    return { success: true, user }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

// Logout function
export function logoutUser(): void {
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('isAuthenticated')
  window.location.href = '/login'
}

// Get current user
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = sessionStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('isAuthenticated') === 'true'
}

// Check user permissions
export function hasPermission(user: User | null, requiredRole: User['user_role']): boolean {
  if (!user) return false

  const roleHierarchy = {
    'employee': 1,
    'manager': 2,
    'stakeholder': 3,
    'admin': 4
  }

  return roleHierarchy[user.user_role] >= roleHierarchy[requiredRole]
}

// Forgot password function
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, employee_name')
      .eq('email', email)
      .eq('status', 'Active')
      .single()

    if (error || !data) {
      return { success: false, error: 'Email not found' }
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with reset token
    const { error: updateError } = await supabase
      .from('employees')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString()
      })
      .eq('id', data.id)

    if (updateError) {
      return { success: false, error: 'Failed to generate reset token' }
    }

    // In a real application, you would send an email here
    // For now, we'll just return success
    console.log(`Password reset token for ${data.employee_name}: ${resetToken}`)

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { success: false, error: 'Password reset failed' }
  }
}

// Reset password function
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const hashedPassword = hashPassword(newPassword)

    const { data, error } = await supabase
      .from('employees')
      .update({
        password_hash: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null
      })
      .eq('password_reset_token', token)
      .gt('password_reset_expires', new Date().toISOString())
      .select()

    if (error || !data || data.length === 0) {
      return { success: false, error: 'Invalid or expired reset token' }
    }

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { success: false, error: 'Password reset failed' }
  }
}

// Set initial passwords for users (run this once after creating users)
export async function setInitialPasswords(): Promise<void> {
  const defaultPassword = 'password123' // Change this in production
  const hashedPassword = hashPassword(defaultPassword)

  const { error } = await supabase
    .from('employees')
    .update({ password_hash: hashedPassword })
    .is('password_hash', null)

  if (error) {
    console.error('Error setting initial passwords:', error)
  } else {
    console.log('Initial passwords set successfully')
  }
}
