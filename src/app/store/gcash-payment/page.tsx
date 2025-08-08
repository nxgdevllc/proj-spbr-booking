'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface Order {
  id?: string
  customer_name: string
  customer_phone: string
  customer_email: string
  items: OrderItem[]
  total_amount: number
  payment_method: 'gcash'
  payment_status: 'pending' | 'paid' | 'failed'
  pickup_status: 'pending' | 'ready' | 'completed'
  order_number: string
  created_at?: string
  pickup_time?: string
  notes?: string
}

function GCashPaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details')
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    pickup_time: '',
    notes: ''
  })

  // Get order data from URL params
  useEffect(() => {
    const itemsParam = searchParams.get('items')
    const totalParam = searchParams.get('total')
    
    if (itemsParam && totalParam) {
      try {
        const items = JSON.parse(decodeURIComponent(itemsParam))
        const total = parseFloat(totalParam)
        
        setOrder({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          items: items,
          total_amount: total,
          payment_method: 'gcash',
          payment_status: 'pending',
          pickup_status: 'pending',
          order_number: generateOrderNumber()
        })
      } catch (error) {
        console.error('Error parsing order data:', error)
        router.push('/store')
      }
    } else {
      router.push('/store')
    }
  }, [searchParams, router])

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `SPBR-${timestamp}-${random}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    return formData.customer_name.trim() && 
           formData.customer_phone.trim() && 
           formData.customer_email.trim() &&
           formData.pickup_time.trim()
  }

  const handleSubmitDetails = () => {
    if (!validateForm()) {
      alert('Please fill in all required fields')
      return
    }

    if (order) {
      setOrder(prev => prev ? {
        ...prev,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        pickup_time: formData.pickup_time,
        notes: formData.notes
      } : null)
      setStep('payment')
    }
  }

  const processGCashPayment = async () => {
    if (!order) return

    setLoading(true)

    try {
      // Simulate GCash payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Create order in database
      const { error } = await supabase
        .from('orders')
        .insert([{
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_email: order.customer_email,
          items: order.items,
          total_amount: order.total_amount,
          payment_method: 'gcash',
          payment_status: 'paid',
          pickup_status: 'pending',
          pickup_time: order.pickup_time,
          notes: order.notes
        }])
        .select()
        .single()

      if (error) throw error

      // Update inventory (reduce stock)
      for (const item of order.items) {
        // Get current stock first
        const { data: currentItem } = await supabase
          .from('inventory_items')
          .select('stock')
          .eq('id', item.id)
          .single()

        if (currentItem) {
          const newStock = Math.max(0, currentItem.stock - item.quantity)
          const { error: inventoryError } = await supabase
            .from('inventory_items')
            .update({ stock: newStock })
            .eq('id', item.id)

          if (inventoryError) {
            console.error('Error updating inventory:', inventoryError)
          }
        }
      }

      setStep('confirmation')

      // Send confirmation email (simulated)
      console.log('Sending confirmation email to:', order.customer_email)

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTotalItems = () => {
    return order?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/store" className="flex items-center text-gray-600 hover:text-green-600">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Store
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">GCash Payment</h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${step === 'details' ? 'text-green-600' : step === 'payment' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'details' ? 'bg-green-600 border-green-600 text-white' : step === 'payment' || step === 'confirmation' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>
                    {step === 'details' ? '1' : '✓'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Order Details</span>
                </div>
                <div className={`w-8 h-1 ${step === 'payment' || step === 'confirmation' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center ${step === 'payment' ? 'text-green-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'payment' ? 'bg-green-600 border-green-600 text-white' : step === 'confirmation' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>
                    {step === 'confirmation' ? '✓' : '2'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment</span>
                </div>
                <div className={`w-8 h-1 ${step === 'confirmation' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center ${step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'confirmation' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Confirmation</span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            {step === 'details' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+63 XXX XXX XXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Pickup Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="pickup_time"
                      value={formData.pickup_time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Any special instructions or requests..."
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSubmitDetails}
                    disabled={!validateForm()}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">GCash Payment</h2>
                
                <div className="text-center mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <CreditCardIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Pay with GCash</h3>
                    <p className="text-green-700 mb-4">
                      Total Amount: <span className="font-bold text-lg">₱{order.total_amount.toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-green-600">
                      Order Number: <span className="font-mono">{order.order_number}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      <li>Open your GCash app</li>
                                             <li>Go to &quot;Send Money&quot; or &quot;Pay Bills&quot;</li>
                      <li>Enter the amount: <span className="font-semibold">₱{order.total_amount.toFixed(2)}</span></li>
                      <li>Add reference: <span className="font-mono">{order.order_number}</span></li>
                      <li>Complete the payment</li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Important:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                      <li>Please include the order number as payment reference</li>
                      <li>Payment will be verified automatically</li>
                                             <li>You&apos;ll receive a confirmation email once payment is confirmed</li>
                      <li>Items will be prepared for pickup at your scheduled time</li>
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('details')}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={processGCashPayment}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      'Confirm Payment'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your order has been confirmed and payment received.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-green-800 mb-4">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Order Number:</span>
                      <span className="font-mono font-semibold">{order.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Amount:</span>
                      <span className="font-semibold">₱{order.total_amount.toFixed(2)}</span>
                    </div>
                                         <div className="flex justify-between">
                       <span className="text-green-700">Pickup Time:</span>
                       <span>{order.pickup_time ? new Date(order.pickup_time).toLocaleString() : 'Not specified'}</span>
                     </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Payment Method:</span>
                      <span>GCash</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-4">Pickup Instructions</h3>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">San Pedro Beach Resort Store</p>
                        <p>Opal, Philippines</p>
                      </div>
                    </div>
                                         <div className="flex items-start">
                       <ClockIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                       <div>
                         <p className="font-medium">Pickup Time</p>
                         <p>{order.pickup_time ? new Date(order.pickup_time).toLocaleString() : 'Not specified'}</p>
                       </div>
                     </div>
                    <div className="flex items-start">
                      <PhoneIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Contact</p>
                        <p>+63 XXX XXX XXXX</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    href="/store"
                    className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₱{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (12%):</span>
                  <span>₱{(order.total_amount * 0.12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">₱{(order.total_amount * 1.12).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {getTotalItems()} items in order
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GCashPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <GCashPaymentPageContent />
    </Suspense>
  )
}
