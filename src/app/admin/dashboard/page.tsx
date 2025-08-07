'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  UsersIcon, 
  HomeIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalEmployees: number
  totalGuests: number
  totalBookings: number
  totalProducts: number
  totalRevenue: number
  activeBookings: number
  lowStockProducts: number
  recentTransactions: Array<{
    transaction_type?: string
    amount?: number
    payment_method?: string
    created_at?: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalGuests: 0,
    totalBookings: 0,
    totalProducts: 0,
    totalRevenue: 0,
    activeBookings: 0,
    lowStockProducts: 0,
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load all stats in parallel
      const [
        employeesResult,
        guestsResult,
        bookingsResult,
        productsResult,
        paymentsResult,
        transactionsResult
      ] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact' }),
        supabase.from('guests').select('*', { count: 'exact' }),
        supabase.from('bookings').select('*', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('payments').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(10)
      ])

      // Calculate total revenue from payments
      const totalRevenue = paymentsResult.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

      // Count active bookings (not checked out)
      const activeBookings = bookingsResult.data?.filter(booking => 
        booking.status !== 'checked_out' && booking.status !== 'cancelled'
      ).length || 0

      // Count low stock products
      const lowStockProducts = productsResult.data?.filter(product => 
        (product.current_stock || 0) <= (product.min_stock_level || 0)
      ).length || 0

      setStats({
        totalEmployees: employeesResult.count || 0,
        totalGuests: guestsResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalRevenue,
        activeBookings,
        lowStockProducts,
        recentTransactions: transactionsResult.data || []
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, href }: {
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    color: string
    href?: string
  }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' && title.includes('Revenue') ? `₱${value.toLocaleString()}` : value}
          </p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
      {href && (
        <a 
          href={href}
          className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
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
    <a 
      href={href}
      className={`block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 ${color}`}
    >
      <div className="flex items-center">
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">San Pedro Beach Resort Management System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={UsersIcon}
            color="border-blue-500"
            href="/admin/data-manager?table=employees"
          />
          <StatCard
            title="Total Guests"
            value={stats.totalGuests}
            icon={UsersIcon}
            color="border-green-500"
            href="/admin/data-manager?table=guests"
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={CalendarIcon}
            color="border-yellow-500"
            href="/admin/data-manager?table=bookings"
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={CurrencyDollarIcon}
            color="border-purple-500"
            href="/admin/data-manager?table=payments"
          />
        </div>

        {/* Quick Actions */}
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
            description="Import CSV files or connect to Google Sheets"
            icon={PlusIcon}
            href="/admin/data-import"
            color="border-green-500"
          />
          <QuickActionCard
            title="Products & Inventory"
            description="Manage store products and stock levels"
            icon={ShoppingBagIcon}
            href="/admin/data-manager?table=products"
            color="border-yellow-500"
          />
          <QuickActionCard
            title="Unit Types"
            description="Manage room types and pricing"
            icon={HomeIcon}
            href="/admin/data-manager?table=unit_types"
            color="border-purple-500"
          />
          <QuickActionCard
            title="Employees"
            description="Manage staff information and records"
            icon={UsersIcon}
            href="/admin/data-manager?table=employees"
            color="border-indigo-500"
          />
          <QuickActionCard
            title="Transactions"
            description="View all financial transactions"
            icon={CurrencyDollarIcon}
            href="/admin/data-manager?table=transactions"
            color="border-red-500"
          />
        </div>

        {/* Alerts and Warnings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Low Stock Alert */}
          {stats.lowStockProducts > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <ShoppingBagIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-yellow-800">Low Stock Alert</h3>
                  <p className="text-yellow-700">
                    {stats.lowStockProducts} product(s) are running low on stock
                  </p>
                  <a 
                    href="/admin/data-manager?table=products"
                    className="mt-2 inline-flex items-center text-sm text-yellow-600 hover:text-yellow-800"
                  >
                    View products
                    <EyeIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {stats.recentTransactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.transaction_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₱{transaction.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.payment_method}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentTransactions.length === 0 && (
                <p className="text-sm text-gray-500">No recent transactions</p>
              )}
            </div>
            <a 
              href="/admin/data-manager?table=transactions"
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              View all transactions
              <EyeIcon className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>

        {/* System Status */}
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
      </div>
    </div>
  )
} 