'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, logoutUser } from '@/lib/auth'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  UsersIcon, 
  HomeIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalEmployees: number
  totalRentalUnits: number
  totalInventoryItems: number
  totalExpenses: number
  totalSalaries: number
  totalWithdrawals: number
  totalAdvances: number
  recentExpenses: Array<{
    date?: string
    amount?: string
    vendor?: string
    category?: string
    status?: string
  }>
  recentSalaries: Array<{
    date?: string
    amount?: number
    name?: string
    payment_type?: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalRentalUnits: 0,
    totalInventoryItems: 0,
    totalExpenses: 0,
    totalSalaries: 0,
    totalWithdrawals: 0,
    totalAdvances: 0,
    recentExpenses: [],
    recentSalaries: []
  })
  const [loading, setLoading] = useState(true)
  const [user] = useState(getCurrentUser())

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load basic stats
      const [employeesResult, unitsResult, inventoryResult, expensesResult, salariesResult, withdrawalsResult, advancesResult] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact' }),
        supabase.from('rental_units_pricing').select('*', { count: 'exact' }),
        supabase.from('inventory_items').select('*', { count: 'exact' }),
        supabase.from('expenses_2025').select('*', { count: 'exact' }),
        supabase.from('employee_salaries_2025').select('*', { count: 'exact' }),
        supabase.from('stakeholder_withdrawals_2025').select('*', { count: 'exact' }),
        supabase.from('employee_advances').select('*', { count: 'exact' })
      ])

      // Load recent data
      const [recentExpensesResult, recentSalariesResult] = await Promise.all([
        supabase.from('expenses_2025').select('*').order('date', { ascending: false }).limit(5),
        supabase.from('employee_salaries_2025').select('*').order('date', { ascending: false }).limit(5)
      ])

      setStats({
        totalEmployees: employeesResult.count || 0,
        totalRentalUnits: unitsResult.count || 0,
        totalInventoryItems: inventoryResult.count || 0,
        totalExpenses: expensesResult.count || 0,
        totalSalaries: salariesResult.count || 0,
        totalWithdrawals: withdrawalsResult.count || 0,
        totalAdvances: advancesResult.count || 0,
        recentExpenses: recentExpensesResult.data || [],
        recentSalaries: recentSalariesResult.data || []
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, href }: {
    title: string
    value: number | string
    icon: React.ComponentType<{ className?: string }>
    color: string
    href?: string
  }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
      {href && (
        <a href={href} className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
          View details
          <EyeIcon className="ml-1 h-4 w-4" />
        </a>
      )}
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, href, color }: {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    href: string
    color: string
  }) => (
    <a href={href} className={`block bg-white rounded-lg shadow p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </a>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Role-based dashboard content
  const renderRoleSpecificContent = () => {
    if (!user) return null

    switch (user.user_role) {
      case 'admin':
        return (
          <>
            {/* Admin Dashboard - Full Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={UsersIcon}
                color="border-blue-500"
                href="/admin/data-manager?table=employees"
              />
              <StatCard
                title="Rental Units"
                value={stats.totalRentalUnits}
                icon={HomeIcon}
                color="border-green-500"
                href="/admin/data-manager?table=rental_units_pricing"
              />
              <StatCard
                title="Inventory Items"
                value={stats.totalInventoryItems}
                icon={ShoppingBagIcon}
                color="border-orange-500"
                href="/admin/data-manager?table=inventory_items"
              />
              <StatCard
                title="Total Expenses"
                value={stats.totalExpenses}
                icon={CurrencyDollarIcon}
                color="border-red-500"
                href="/admin/data-manager?table=expenses_2025"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <QuickActionCard
                title="Data Manager"
                description="View and edit all data in spreadsheet format"
                icon={ChartBarIcon}
                href="/admin/data-manager"
                color="border-blue-500"
              />
              <QuickActionCard
                title="Import Data"
                description="Import CSV files into the system"
                icon={PlusIcon}
                href="/admin/data-import"
                color="border-green-500"
              />
              <QuickActionCard
                title="System Settings"
                description="Manage system configuration"
                icon={CogIcon}
                href="/admin/settings"
                color="border-purple-500"
              />
            </div>
          </>
        )

      case 'manager':
        return (
          <>
            {/* Manager Dashboard - Management Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={UsersIcon}
                color="border-blue-500"
                href="/admin/data-manager?table=employees"
              />
              <StatCard
                title="Rental Units"
                value={stats.totalRentalUnits}
                icon={HomeIcon}
                color="border-green-500"
                href="/admin/data-manager?table=rental_units_pricing"
              />
              <StatCard
                title="Inventory Items"
                value={stats.totalInventoryItems}
                icon={ShoppingBagIcon}
                color="border-orange-500"
                href="/admin/data-manager?table=inventory_items"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <QuickActionCard
                title="Data Manager"
                description="View and edit resort data"
                icon={ChartBarIcon}
                href="/admin/data-manager"
                color="border-blue-500"
              />
              <QuickActionCard
                title="Employee Management"
                description="Manage employee records and schedules"
                icon={UsersIcon}
                href="/admin/data-manager?table=employees"
                color="border-green-500"
              />
            </div>
          </>
        )

      case 'stakeholder':
        return (
          <>
            {/* Stakeholder Dashboard - Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Expenses"
                value={stats.totalExpenses}
                icon={CurrencyDollarIcon}
                color="border-red-500"
                href="/admin/data-manager?table=expenses_2025"
              />
              <StatCard
                title="Total Salaries"
                value={stats.totalSalaries}
                icon={UsersIcon}
                color="border-blue-500"
                href="/admin/data-manager?table=employee_salaries_2025"
              />
              <StatCard
                title="Withdrawals"
                value={stats.totalWithdrawals}
                icon={CurrencyDollarIcon}
                color="border-orange-500"
                href="/admin/data-manager?table=stakeholder_withdrawals_2025"
              />
              <StatCard
                title="Employee Advances"
                value={stats.totalAdvances}
                icon={CurrencyDollarIcon}
                color="border-yellow-500"
                href="/admin/data-manager?table=employee_advances"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <QuickActionCard
                title="Financial Reports"
                description="View financial data and reports"
                icon={ChartBarIcon}
                href="/admin/data-manager"
                color="border-blue-500"
              />
              <QuickActionCard
                title="Expense Tracking"
                description="Monitor resort expenses"
                icon={CurrencyDollarIcon}
                href="/admin/data-manager?table=expenses_2025"
                color="border-green-500"
              />
            </div>
          </>
        )

      case 'employee':
      default:
        return (
          <>
            {/* Employee Dashboard - Basic Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={UsersIcon}
                color="border-blue-500"
              />
              <StatCard
                title="Rental Units"
                value={stats.totalRentalUnits}
                icon={HomeIcon}
                color="border-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <QuickActionCard
                title="View Data"
                description="Browse resort information"
                icon={EyeIcon}
                href="/admin/data-manager"
                color="border-blue-500"
              />
              <QuickActionCard
                title="My Tasks"
                description="View assigned tasks and responsibilities"
                icon={ClipboardDocumentListIcon}
                href="/admin/tasks"
                color="border-green-500"
              />
            </div>
          </>
        )
    }
  }

  return (
    <ProtectedRoute requiredRole="employee">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.user_role === 'admin' ? 'Admin Dashboard' :
                 user?.user_role === 'manager' ? 'Manager Dashboard' :
                 user?.user_role === 'stakeholder' ? 'Financial Dashboard' :
                 'Employee Dashboard'}
              </h1>
              <p className="mt-2 text-gray-600">San Pedro Beach Resort Management System</p>
            </div>
            
            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.employee_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.user_role} • {user.employee_role}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <button
                    onClick={logoutUser}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role-specific content */}
          {renderRoleSpecificContent()}

          {/* Recent Activity - Show different content based on role */}
          {user && (user.user_role === 'admin' || user.user_role === 'stakeholder') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Expenses */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
                <div className="space-y-3">
                  {stats.recentExpenses.slice(0, 5).map((expense, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {expense.vendor}
                        </p>
                        <p className="text-xs text-gray-500">
                          {expense.date} • {expense.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₱{expense.amount}
                        </p>
                        <p className="text-xs text-gray-500">
                          {expense.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  {stats.recentExpenses.length === 0 && (
                    <p className="text-sm text-gray-500">No recent expenses</p>
                  )}
                </div>
                <a 
                  href="/admin/data-manager?table=expenses_2025"
                  className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  View all expenses
                  <EyeIcon className="ml-1 h-4 w-4" />
                </a>
              </div>

              {/* Recent Salaries */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Salaries</h3>
                <div className="space-y-3">
                  {stats.recentSalaries.slice(0, 5).map((salary, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {salary.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {salary.date} • {salary.payment_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₱{salary.amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {stats.recentSalaries.length === 0 && (
                    <p className="text-sm text-gray-500">No recent salaries</p>
                  )}
                </div>
                <a 
                  href="/admin/data-manager?table=employee_salaries_2025"
                  className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  View all salaries
                  <EyeIcon className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          {/* System Status - Admin only */}
          {user && user.user_role === 'admin' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Database Connected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Import System Ready</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Data Manager Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}