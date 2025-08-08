'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'POS System', href: '/admin/pos', icon: '💳' },
  { name: 'Inventory Count', href: '/admin/inventory-count', icon: '📋' },
  { name: 'Photo Management', href: '/admin/photo-management', icon: '📸' },
  { name: 'Data Manager', href: '/admin/data-manager', icon: '📁' },
  { name: 'Data Import', href: '/admin/data-import', icon: '📥' },
]

export default function AdminHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { userProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/admin/dashboard" className="flex items-center">
                <span className="text-2xl mr-2">🏖️</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    San Pedro Beach Resort
                  </h1>
                  <p className="text-xs text-gray-500">Management System</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700">
              <UserCircleIcon className="h-5 w-5" />
              <span>{userProfile?.full_name || 'User'}</span>
              <span className="text-gray-500">({userProfile?.role || 'guest'})</span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">Sign Out</span>
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-gray-700 hover:text-green-600 hover:bg-gray-50 px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center px-3 py-2 text-sm text-gray-700">
                <UserCircleIcon className="h-5 w-5 mr-2" />
                <span>{userProfile?.full_name || 'User'}</span>
                <span className="ml-2 text-gray-500">({userProfile?.role || 'guest'})</span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full text-gray-700 hover:text-red-600 hover:bg-gray-50 px-3 py-2 text-base font-medium transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
