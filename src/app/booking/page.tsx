'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  CalendarDaysIcon,
  UserIcon,
  CreditCardIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Unit {
  id: string
  unit_number: string
  unit_type: string
  maximum_capacity: number
  day_rate: number
  night_rate: number
  status: string
}

interface BookingForm {
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  unit_id: string
  number_of_guests: number
  payment_method: 'gcash' | 'cash'
  payment_type: 'deposit' | 'full'
  deposit_amount?: number
  special_requests: string
}

export default function BookingPage() {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<BookingForm>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: '',
    check_out_date: '',
    unit_id: '',
    number_of_guests: 1,
    payment_method: 'gcash',
    payment_type: 'deposit',
    deposit_amount: 0,
    special_requests: ''
  })
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [totalNights, setTotalNights] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(1)

  // Load available units
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .eq('status', 'available')
          .order('unit_number')

        if (error) throw error
        setUnits(data || [])
      } catch (error) {
        console.error('Error loading units:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUnits()
  }, [])

  // Calculate total nights and amount
  useEffect(() => {
    if (booking.check_in_date && booking.check_out_date && selectedUnit) {
      const checkIn = new Date(booking.check_in_date)
      const checkOut = new Date(booking.check_out_date)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      
      setTotalNights(nights)
      setTotalAmount(nights * selectedUnit.day_rate)
    }
  }, [booking.check_in_date, booking.check_out_date, selectedUnit])

  // Update selected unit when unit_id changes
  useEffect(() => {
    if (booking.unit_id) {
      const unit = units.find(u => u.id === booking.unit_id)
      setSelectedUnit(unit || null)
    }
  }, [booking.unit_id, units])

  const handleInputChange = (field: keyof BookingForm, value: string | number) => {
    setBooking(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!booking.guest_name || !booking.guest_email || !booking.guest_phone) {
      return 'Please fill in all guest information'
    }
    if (!booking.check_in_date || !booking.check_out_date) {
      return 'Please select check-in and check-out dates'
    }
    if (!booking.unit_id) {
      return 'Please select a unit'
    }
    if (booking.number_of_guests > (selectedUnit?.maximum_capacity || 1)) {
      return `Maximum capacity for this unit is ${selectedUnit?.maximum_capacity} guests`
    }
    if (booking.payment_type === 'deposit' && (!booking.deposit_amount || booking.deposit_amount <= 0)) {
      return 'Please specify deposit amount'
    }
    return null
  }

  const generateBookingNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `SP${year}${month}${day}${random}`
  }

  const processBooking = async () => {
    const error = validateForm()
    if (error) {
      alert(error)
      return
    }

    setProcessing(true)
    try {
      const bookingNumber = generateBookingNumber()
      const finalAmount = booking.payment_type === 'deposit' ? (booking.deposit_amount || 0) : totalAmount

      // Create booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_number: bookingNumber,
          guest_name: booking.guest_name,
          guest_email: booking.guest_email,
          guest_phone: booking.guest_phone,
          unit_id: booking.unit_id,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          number_of_guests: booking.number_of_guests,
          total_amount: totalAmount,
          deposit_amount: booking.deposit_amount || 0,
          payment_method: booking.payment_method,
          payment_type: booking.payment_type,
          special_requests: booking.special_requests,
          status: 'confirmed',
          created_at: new Date().toISOString()
        })
        .select()

      if (bookingError) throw bookingError

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingData[0].id,
          amount: finalAmount,
          payment_method: booking.payment_method,
          payment_type: booking.payment_type,
          status: booking.payment_method === 'gcash' ? 'pending' : 'paid',
          transaction_id: booking.payment_method === 'gcash' ? `GCASH_${Date.now()}` : null,
          created_at: new Date().toISOString()
        })

      if (paymentError) throw paymentError

      // Update unit status
      const { error: unitError } = await supabase
        .from('units')
        .update({ status: 'booked' })
        .eq('id', booking.unit_id)

      if (unitError) throw unitError

      // Redirect to payment or confirmation
      if (booking.payment_method === 'gcash') {
        router.push(`/booking/payment/${bookingData[0].id}`)
      } else {
        router.push(`/booking/confirmation/${bookingData[0].id}`)
      }

    } catch (error) {
      console.error('Booking error:', error)
      alert('Error processing booking. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getMinCheckOutDate = () => {
    if (!booking.check_in_date) return ''
    const checkIn = new Date(booking.check_in_date)
    const nextDay = new Date(checkIn)
    nextDay.setDate(nextDay.getDate() + 1)
    return nextDay.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Stay</h1>
          <p className="text-gray-600">Reserve your perfect beach getaway at San Pedro Beach Resort</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            {step === 1 && 'Guest Information'}
            {step === 2 && 'Room Selection'}
            {step === 3 && 'Payment Details'}
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={booking.guest_name}
                    onChange={(e) => handleInputChange('guest_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={booking.guest_email}
                    onChange={(e) => handleInputChange('guest_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={booking.guest_phone}
                    onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <select
                    value={booking.number_of_guests}
                    onChange={(e) => handleInputChange('number_of_guests', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!booking.guest_name || !booking.guest_email || !booking.guest_phone}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next: Select Room
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Selection & Dates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={booking.check_in_date}
                    onChange={(e) => handleInputChange('check_in_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={booking.check_out_date}
                    onChange={(e) => handleInputChange('check_out_date', e.target.value)}
                    min={getMinCheckOutDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Room *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() => handleInputChange('unit_id', unit.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        booking.unit_id === unit.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900">{unit.unit_type}</h3>
                      <p className="text-sm text-gray-600">Unit {unit.unit_number}</p>
                      <p className="text-sm text-gray-600">Max {unit.maximum_capacity} guests</p>
                      <p className="text-lg font-bold text-green-600">₱{unit.day_rate}/night</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedUnit && totalNights > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Room Type:</span>
                      <span>{selectedUnit.unit_type} - Unit {selectedUnit.unit_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{totalNights} {totalNights === 1 ? 'night' : 'nights'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per night:</span>
                      <span>₱{selectedUnit.day_rate}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount:</span>
                      <span>₱{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!booking.check_in_date || !booking.check_out_date || !booking.unit_id}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next: Payment
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="gcash"
                        checked={booking.payment_method === 'gcash'}
                        onChange={(e) => handleInputChange('payment_method', e.target.value)}
                        className="mr-2"
                      />
                      <CreditCardIcon className="h-5 w-5 text-green-600 mr-2" />
                      GCash (Online Payment)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="cash"
                        checked={booking.payment_method === 'cash'}
                        onChange={(e) => handleInputChange('payment_method', e.target.value)}
                        className="mr-2"
                      />
                      Cash (Pay at Check-in)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="deposit"
                        checked={booking.payment_type === 'deposit'}
                        onChange={(e) => handleInputChange('payment_type', e.target.value)}
                        className="mr-2"
                      />
                      Deposit (₱{Math.round(totalAmount * 0.3).toLocaleString()})
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="full"
                        checked={booking.payment_type === 'full'}
                        onChange={(e) => handleInputChange('payment_type', e.target.value)}
                        className="mr-2"
                      />
                      Full Payment (₱{totalAmount.toLocaleString()})
                    </label>
                  </div>
                </div>
              </div>

              {booking.payment_type === 'deposit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Amount *
                  </label>
                  <input
                    type="number"
                    value={booking.deposit_amount || ''}
                    onChange={(e) => handleInputChange('deposit_amount', parseFloat(e.target.value) || 0)}
                    min={Math.round(totalAmount * 0.3)}
                    max={totalAmount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Minimum: ₱${Math.round(totalAmount * 0.3).toLocaleString()}`}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum deposit: 30% of total amount (₱{Math.round(totalAmount * 0.3).toLocaleString()})
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={booking.special_requests}
                  onChange={(e) => handleInputChange('special_requests', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any special requests or requirements..."
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Final Summary</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span>₱{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{booking.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Type:</span>
                    <span className="capitalize">{booking.payment_type}</span>
                  </div>
                  {booking.payment_type === 'deposit' && (
                    <div className="flex justify-between">
                      <span>Deposit Amount:</span>
                      <span>₱{(booking.deposit_amount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Amount Due:</span>
                    <span className="font-semibold">
                      ₱{booking.payment_type === 'deposit' 
                        ? (booking.deposit_amount || 0).toLocaleString() 
                        : totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={processBooking}
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
