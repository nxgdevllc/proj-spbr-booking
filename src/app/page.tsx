'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  SunIcon,
} from '@heroicons/react/24/outline'

interface RentalUnitPricing {
  id: number
  unit_id: string
  rental_type: string
  maximum_capacity: number | null
  day_rate: string | null
  night_rate: string | null
  ['24hr_rate']: string | null
  notes: string | null
}

interface InventoryItem {
  id: number
  sid: string
  category: string
  product_name: string
  stock: number
  size: string | null
  units: string | null
  price: number
  min_level: number | null
  supplier: string | null
  barcode: string | null
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

export default function Home() {
  const [units, setUnits] = useState<RentalUnitPricing[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [booking, setBooking] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    rentalType: '',
    unitId: '',
  })
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [unitsRes, itemsRes] = await Promise.all([
          supabase.from('rental_units_pricing').select('*').order('rental_type', { ascending: true }),
          supabase.from('inventory_items').select('*').order('category', { ascending: true }),
        ])
        if (!mounted) return
        setUnits((unitsRes.data as unknown as RentalUnitPricing[]) || [])
        setItems((itemsRes.data as unknown as InventoryItem[]) || [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const rentalTypes = Array.from(new Set(units.map(u => u.rental_type)))
  const filteredUnits = booking.rentalType ? units.filter(u => u.rental_type === booking.rentalType) : units

  const addToCart = (item: InventoryItem) => {
    setOrderPlaced(false)
    setCart(prev => {
      const existing = prev.find(ci => ci.id === item.id)
      if (existing) {
        return prev.map(ci => (ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci))
      }
      return [...prev, { id: item.id, name: item.product_name, price: item.price || 0, quantity: 1 }]
    })
  }

  const updateCartQty = (id: number, delta: number) => {
    setCart(prev =>
      prev
        .map(ci => (ci.id === id ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci))
        .filter(ci => ci.quantity > 0),
    )
  }

  const cartTotal = cart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0)

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    setBookingSubmitted(true)
    setTimeout(() => setBookingSubmitted(false), 3000)
  }

  const placeOrder = () => {
    setOrderPlaced(true)
    setTimeout(() => setOrderPlaced(false), 3000)
    setCart([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-yellow-900">
      {/* Desktop Navigation */}
      <header className="hidden md:block bg-gray-800/95 backdrop-blur-sm shadow-lg border-b border-green-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-green-400">
                  San Pedro Beach Resort
                </h1>
                <p className="text-sm text-green-300">Opal, Philippines</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-8">
              <button 
                onClick={() => setActiveSection('hero')} 
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'hero' 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-gray-300 hover:text-green-400'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveSection('booking')} 
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'booking' 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-gray-300 hover:text-green-400'
                }`}
              >
                Book Now
              </button>
              <button 
                onClick={() => setActiveSection('store')} 
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'store' 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-gray-300 hover:text-green-400'
                }`}
              >
                Store
              </button>
              <button 
                onClick={() => setActiveSection('contact')} 
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'contact' 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-gray-300 hover:text-green-400'
                }`}
              >
                Contact
              </button>
            </nav>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveSection('store')}
                className="relative bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <header className="md:hidden bg-gray-800/95 backdrop-blur-sm shadow-lg border-b border-green-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-lg font-bold text-green-400">
                  San Pedro Beach Resort
                </h1>
                <p className="text-xs text-green-300">Opal, Philippines</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveSection('store')}
                className="relative bg-yellow-500 text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-all duration-200 shadow-md"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="bg-gray-800/95 backdrop-blur-sm border-t border-green-600/30 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex flex-col space-y-1">
                                 <button 
                   onClick={() => {
                     setActiveSection('hero')
                     setMobileMenuOpen(false)
                   }} 
                   className={`text-left py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                     activeSection === 'hero' 
                       ? 'bg-green-900/50 text-green-400' 
                       : 'text-gray-300 hover:bg-green-900/30 hover:text-green-400'
                   }`}
                 >
                   🏠 Home
                 </button>
                 <button 
                   onClick={() => {
                     setActiveSection('booking')
                     setMobileMenuOpen(false)
                   }} 
                   className={`text-left py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                     activeSection === 'booking' 
                       ? 'bg-green-900/50 text-green-400' 
                       : 'text-gray-300 hover:bg-green-900/30 hover:text-green-400'
                   }`}
                 >
                   📅 Book Now
                 </button>
                 <button 
                   onClick={() => {
                     setActiveSection('store')
                     setMobileMenuOpen(false)
                   }} 
                   className={`text-left py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                     activeSection === 'store' 
                       ? 'bg-green-900/50 text-green-400' 
                       : 'text-gray-300 hover:bg-green-900/30 hover:text-green-400'
                   }`}
                 >
                   🛍️ Store
                 </button>
                 <button 
                   onClick={() => {
                     setActiveSection('contact')
                     setMobileMenuOpen(false)
                   }} 
                   className={`text-left py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                     activeSection === 'contact' 
                       ? 'bg-green-900/50 text-green-400' 
                       : 'text-gray-300 hover:bg-green-900/30 hover:text-green-400'
                   }`}
                 >
                   📞 Contact
                 </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      {activeSection === 'hero' && (
        <section className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-green-900/40"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <SunIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                Welcome to Paradise
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
                Experience the beauty of Opal, Philippines at San Pedro Beach Resort. 
                Your perfect getaway awaits with pristine beaches and unforgettable memories.
              </p>
            </div>
            
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                 <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-green-600/30">
                   <div className="h-12 w-12 text-green-400 mx-auto mb-4 flex items-center justify-center">
                     <span className="text-2xl">🌊</span>
                   </div>
                   <h3 className="text-lg font-semibold text-white mb-2">Beachfront Location</h3>
                   <p className="text-gray-300">Direct access to pristine beaches with crystal clear waters</p>
                 </div>
                 <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-yellow-600/30">
                   <div className="h-12 w-12 text-yellow-400 mx-auto mb-4 flex items-center justify-center">
                     <span className="text-2xl">🏖️</span>
                   </div>
                   <h3 className="text-lg font-semibold text-white mb-2">Comfortable Accommodations</h3>
                   <p className="text-gray-300">Cozy rooms and cottages perfect for families and groups</p>
                 </div>
                 <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-green-600/30">
                   <StarIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                   <h3 className="text-lg font-semibold text-white mb-2">5-Star Experience</h3>
                   <p className="text-gray-300">Exceptional service and amenities for your perfect stay</p>
                 </div>
               </div>

                         <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button
                 onClick={() => setActiveSection('booking')}
                 className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
               >
                 Book Your Stay
               </button>
               <button
                 onClick={() => setActiveSection('store')}
                 className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-medium hover:bg-yellow-600 transition-colors shadow-lg"
               >
                 Visit Our Store
               </button>
             </div>
          </div>
        </section>
      )}

      {/* Booking Section */}
      {activeSection === 'booking' && (
        <section className="py-16 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Book Your Perfect Stay</h2>
              <p className="text-xl text-gray-300">Choose your dates and accommodation for an unforgettable experience</p>
            </div>
            
                         <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-lg p-8 border border-green-600/30">
              <form onSubmit={submitBooking} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div>
                                     <label className="block text-sm font-medium text-gray-300 mb-1">Check-in</label>
                                     <input
                     type="date"
                     required
                     value={booking.checkIn}
                     onChange={e => setBooking({ ...booking, checkIn: e.target.value })}
                     className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                   />
                </div>
                <div>
                                     <label className="block text-sm font-medium text-gray-300 mb-1">Check-out</label>
                                     <input
                     type="date"
                     required
                     value={booking.checkOut}
                     onChange={e => setBooking({ ...booking, checkOut: e.target.value })}
                     className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                                     <input
                     type="number"
                     min={1}
                     max={20}
                     value={booking.guests}
                     onChange={e => setBooking({ ...booking, guests: Number(e.target.value) })}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                     <select
                     value={booking.rentalType}
                     onChange={e => setBooking({ ...booking, rentalType: e.target.value, unitId: '' })}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                   >
                    <option value="">Any Type</option>
                    {rentalTypes.map(rt => (
                      <option key={rt} value={rt}>{rt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                                     <button
                     type="submit"
                     className="w-full bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition-colors"
                     disabled={loading}
                   >
                    Check Availability
                  </button>
                </div>
              </form>

              {bookingSubmitted && (
                <div className="mb-6 flex items-center justify-center text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                                     <p className="text-sm">Your booking request has been received! We&apos;ll confirm availability shortly.</p>
                </div>
              )}

              {/* Available Units */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Available Accommodations</h3>
                {loading ? (
                  <p className="text-gray-500">Loading accommodations...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUnits.slice(0, 6).map(u => (
                      <div key={u.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg text-gray-900">{u.unit_id}</h4>
                                                     <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">{u.rental_type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Max {u.maximum_capacity ?? '—'} guests</p>
                        <div className="space-y-1 text-sm">
                          {u.day_rate && <p className="text-gray-800">Day Rate: ₱{u.day_rate}</p>}
                          {u.night_rate && <p className="text-gray-800">Night Rate: ₱{u.night_rate}</p>}
                          {u['24hr_rate'] && <p className="text-gray-800 font-semibold">24hr Rate: ₱{u['24hr_rate']}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Store Section */}
      {activeSection === 'store' && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Resort Store</h2>
              <p className="text-xl text-gray-600">Pre-order essentials and treats for your stay</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold text-gray-900">Available Items</h3>
                <div className="flex items-center text-sm text-gray-700">
                  <ShoppingCartIcon className="h-5 w-5 mr-1" /> 
                  {cart.reduce((a, b) => a + b.quantity, 0)} items • 
                  Total: ₱{cartTotal.toLocaleString()}
                </div>
              </div>

              {loading ? (
                <p className="text-gray-500">Loading items...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {items.slice(0, 12).map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="font-medium text-gray-900 truncate mb-1" title={item.product_name}>
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                                             <div className="text-lg font-semibold text-green-600 mb-3">₱{(item.price || 0).toLocaleString()}</div>
                                             <button
                         onClick={() => addToCart(item)}
                         className="w-full bg-yellow-500 text-gray-900 rounded-md py-2 text-sm hover:bg-yellow-600 transition-colors"
                       >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Cart */}
              {cart.length > 0 && (
                <div className="border-t pt-8">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Your Cart</h4>
                  <div className="space-y-3 mb-6">
                    {cart.map(ci => (
                      <div key={ci.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ci.name}</p>
                          <p className="text-xs text-gray-500">₱{ci.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => updateCartQty(ci.id, -1)} className="p-1 rounded bg-gray-200 hover:bg-gray-300">
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-sm w-6 text-center">{ci.quantity}</span>
                          <button onClick={() => updateCartQty(ci.id, 1)} className="p-1 rounded bg-gray-200 hover:bg-gray-300">
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t pt-4 mb-4">
                    <p className="text-lg font-semibold text-gray-900">Total</p>
                                         <p className="text-lg font-bold text-green-600">₱{cartTotal.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <p className="text-sm text-gray-600">Payment: GCash or Cash on pickup</p>
                                         <button
                       onClick={placeOrder}
                       className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                     >
                      Place Order
                    </button>
                  </div>
                  {orderPlaced && (
                    <div className="mt-4 flex items-center text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      <p className="text-sm">Order placed! We&apos;ll have it ready for pickup.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {activeSection === 'contact' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-xl text-gray-600">Get in touch for reservations and inquiries</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
                <div className="space-y-4">
                                     <div className="flex items-center">
                     <MapPinIcon className="h-6 w-6 text-green-600 mr-3" />
                     <div>
                       <p className="font-medium text-gray-900">Location</p>
                       <p className="text-gray-600">Opal, Philippines</p>
                     </div>
                   </div>
                   <div className="flex items-center">
                     <PhoneIcon className="h-6 w-6 text-green-600 mr-3" />
                     <div>
                       <p className="font-medium text-gray-900">Phone</p>
                       <p className="text-gray-600">+63 XXX XXX XXXX</p>
                     </div>
                   </div>
                   <div className="flex items-center">
                     <EnvelopeIcon className="h-6 w-6 text-green-600 mr-3" />
                     <div>
                       <p className="font-medium text-gray-900">Email</p>
                       <p className="text-gray-600">info@sanpedrobeachresort.com</p>
                     </div>
                   </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Business Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Check-in:</span> 2:00 PM</p>
                  <p><span className="font-medium">Check-out:</span> 12:00 PM</p>
                  <p><span className="font-medium">Store:</span> 7:00 AM - 9:00 PM</p>
                  <p><span className="font-medium">Reception:</span> 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer with Admin Access */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h4 className="text-xl font-semibold mb-4">San Pedro Beach Resort</h4>
              <p className="text-gray-300 mb-4">
                Experience paradise in Opal, Philippines. Book your stay and create unforgettable memories 
                with pristine beaches, comfortable accommodations, and exceptional service.
              </p>
                             <div className="flex space-x-4">
                 <button onClick={() => setActiveSection('booking')} className="text-green-400 hover:text-green-300">
                   Book Now
                 </button>
                 <button onClick={() => setActiveSection('store')} className="text-green-400 hover:text-green-300">
                   Store
                 </button>
                 <button onClick={() => setActiveSection('contact')} className="text-green-400 hover:text-green-300">
                   Contact
                 </button>
               </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => setActiveSection('hero')} className="hover:text-white">Home</button></li>
                <li><button onClick={() => setActiveSection('booking')} className="hover:text-white">Bookings</button></li>
                <li><button onClick={() => setActiveSection('store')} className="hover:text-white">Store</button></li>
                <li><button onClick={() => setActiveSection('contact')} className="hover:text-white">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Staff Access</h4>
                             <Link 
                 href="/login" 
                 className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors mb-2"
               >
                Employee Login
              </Link>
              <p className="text-xs text-gray-400">Staff and management access only</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 San Pedro Beach Resort. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
