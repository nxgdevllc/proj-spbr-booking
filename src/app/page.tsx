'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ShoppingCartIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-yellow-600">🏖️</span>
                <span className="ml-2 text-xl font-bold text-green-600">San Pedro Beach Resort</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#booking" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Book Room
              </Link>
              <Link href="/store" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Visit Store
              </Link>
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Staff Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-green-600 p-2"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
                <Link href="#booking" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                  Book Room
                </Link>
                <Link href="/store" className="block px-3 py-2 bg-green-600 text-white rounded-lg">
                  Visit Store
                </Link>
                <Link href="/admin/dashboard" className="block px-3 py-2 text-gray-700 hover:text-green-600">
                  Staff Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-yellow-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to San Pedro Beach Resort
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Your Perfect Beach Getaway in Opal, Philippines
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#booking"
                className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <CalendarDaysIcon className="h-6 w-6 mr-2" />
                Book Your Stay
              </Link>
              <Link
                href="/store"
                className="bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center"
              >
                <ShoppingCartIcon className="h-6 w-6 mr-2" />
                Shop at Our Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of relaxation and convenience at San Pedro Beach Resort
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏖️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful Beach Access</h3>
              <p className="text-gray-600">Direct access to pristine beaches with crystal clear waters</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCartIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Convenient Store</h3>
              <p className="text-gray-600">Shop essentials, snacks, and souvenirs with easy pickup options</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellent Service</h3>
              <p className="text-gray-600">Friendly staff dedicated to making your stay memorable</p>
            </div>
          </div>
        </div>
      </section>

      {/* Store Highlight Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Resort Store
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Browse our convenient store for everything you need during your stay. From snacks and beverages to beach essentials and souvenirs.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Food & Beverages
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Beach & Swimming Essentials
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Toiletries & Supplies
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Pay Cash or GCash
                  </li>
                </ul>
                <Link
                  href="/store"
                  className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <ShoppingCartIcon className="h-6 w-6 mr-2" />
                  Browse Store
                </Link>
              </div>
              <div className="md:w-1/2 bg-gradient-to-br from-green-500 to-yellow-500 p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <ShoppingCartIcon className="h-24 w-24 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Shop Online</h3>
                  <p className="text-green-100">Order now, pickup at the resort</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Book Your Stay</h2>
            <p className="text-lg text-gray-600">
              Ready to experience paradise? Contact us to book your room today!
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">+63 XXX XXX XXXX</span>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">info@sanpedrobeachresort.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Opal, Philippines</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Room Types Available</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Standard Rooms</li>
                  <li>• Deluxe Rooms</li>
                  <li>• Family Cottages</li>
                  <li>• Beachfront Villas</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link
                href="tel:+63XXXXXXXXX"
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center"
              >
                <PhoneIcon className="h-6 w-6 mr-2" />
                Call to Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-yellow-400">🏖️</span>
                <span className="ml-2 text-xl font-bold text-white">San Pedro Beach Resort</span>
              </div>
              <p className="text-gray-300">
                Your perfect beach getaway destination in Opal, Philippines.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#booking" className="text-gray-300 hover:text-white transition-colors">Book Room</Link></li>
                <li><Link href="/store" className="text-gray-300 hover:text-white transition-colors">Store</Link></li>
                <li><Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors">Staff Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <p className="text-gray-300 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Opal, Philippines
                </p>
                <p className="text-gray-300 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  +63 XXX XXX XXXX
                </p>
                <p className="text-gray-300 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  info@sanpedrobeachresort.com
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">© 2024 San Pedro Beach Resort. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}