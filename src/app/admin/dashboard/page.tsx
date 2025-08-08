'use client'

import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminHeader from '@/components/AdminHeader'
import Link from 'next/link'
import { 
  ShoppingCartIcon, 
  ClipboardDocumentListIcon, 
  PhotoIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const quickActions = [
  {
    name: 'POS System',
    description: 'Process sales and manage transactions',
    href: '/admin/pos',
    icon: ShoppingCartIcon,
    color: 'bg-green-500',
    role: 'employee'
  },
  {
    name: 'Inventory Count',
    description: 'Monthly inventory counting system',
    href: '/admin/inventory-count',
    icon: ClipboardDocumentListIcon,
    color: 'bg-blue-500',
    role: 'manager'
  },
  {
    name: 'Photo Management',
    description: 'Manage product photos and images',
    href: '/admin/photo-management',
    icon: PhotoIcon,
    color: 'bg-purple-500',
    role: 'manager'
  },
  {
    name: 'Data Manager',
    description: 'View and edit all data tables',
    href: '/admin/data-manager',
    icon: DocumentTextIcon,
    color: 'bg-yellow-500',
    role: 'manager'
  },
  {
    name: 'Data Import',
    description: 'Import data from CSV files',
    href: '/admin/data-import',
    icon: ArrowDownTrayIcon,
    color: 'bg-red-500',
    role: 'admin'
  },
  {
    name: 'Reports',
    description: 'View system reports and analytics',
    href: '/admin/reports',
    icon: ChartBarIcon,
    color: 'bg-indigo-500',
    role: 'manager'
  },
  {
    name: 'User Management',
    description: 'Manage users and permissions',
    href: '/admin/users',
    icon: UserGroupIcon,
    color: 'bg-pink-500',
    role: 'admin'
  },
  {
    name: 'Financial Reports',
    description: 'View financial data and reports',
    href: '/admin/financial',
    icon: CurrencyDollarIcon,
    color: 'bg-emerald-500',
    role: 'admin'
  }
]

export default function AdminDashboard() {
  const { userProfile } = useAuth()

  const roleHierarchy = {
    'guest': 0,
    'employee': 1,
    'manager': 2,
    'admin': 3
  }

  const userLevel = roleHierarchy[userProfile?.role as keyof typeof roleHierarchy] || 0

  const filteredActions = quickActions.filter(action => {
    const actionLevel = roleHierarchy[action.role as keyof typeof roleHierarchy] || 0
    return userLevel >= actionLevel
  })

  return (
    <ProtectedRoute requiredRole="employee">
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {userProfile?.full_name || 'User'}!
              </h1>
              <p className="text-gray-600">
                You are logged in as a <span className="font-semibold capitalize">{userProfile?.role || 'guest'}</span>.
                Here are the tools you have access to:
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 ${action.color} rounded-md p-3`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {action.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* System Status */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">System Online</p>
                      <p className="text-xs text-green-600">All services operational</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">🔐</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Authentication</p>
                      <p className="text-xs text-blue-600">Supabase Auth enabled</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">🛡️</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-800">Security</p>
                      <p className="text-xs text-purple-600">RLS policies active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📊</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">Database</p>
                      <p className="text-xs text-yellow-600">PostgreSQL + Supabase</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}