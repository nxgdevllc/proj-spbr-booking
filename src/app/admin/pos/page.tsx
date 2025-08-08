'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  QrCodeIcon,
  CalculatorIcon,
  PrinterIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface InventoryItem {
  id: number
  category: string
  product_name: string
  stock: number
  size: string | null
  units: string | null
  price: number
  barcode: string | null
  barcode_type: string | null
}

interface SaleItem {
  id: number
  name: string
  price: number
  quantity: number
  maxStock: number
  barcode?: string | null
}

interface Sale {
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  amountPaid: number
  change: number
  paymentMethod: 'cash' | 'gcash'
}

export default function POSPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [cart, setCart] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash')
  const [showPayment, setShowPayment] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentSale, setCurrentSale] = useState<Sale | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load inventory items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .gt('stock', 0)
          .order('product_name', { ascending: true })
        
        if (error) throw error
        setItems(data || [])
      } catch (error) {
        console.error('Error loading items:', error)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  // Focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [])

  // Handle barcode scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    const item = items.find(item => 
      item.barcode === barcodeInput.trim() ||
      item.id.toString() === barcodeInput.trim()
    )

    if (item) {
      addToCart(item)
      setBarcodeInput('')
    } else {
      alert('Product not found!')
      setBarcodeInput('')
    }
  }

  // Add item to cart
  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.id === item.id)
      if (existing) {
        if (existing.quantity < item.stock) {
          return prev.map(ci => 
            ci.id === item.id 
              ? { ...ci, quantity: ci.quantity + 1 }
              : ci
          )
        } else {
          alert('Not enough stock!')
          return prev
        }
      }
      return [...prev, {
        id: item.id,
        name: item.product_name,
        price: item.price,
        quantity: 1,
        maxStock: item.stock,
        barcode: item.barcode
      }]
    })
  }

  // Update cart item quantity
  const updateCartQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setCart(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.min(quantity, item.maxStock) }
        : item
    ))
  }

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setAmountPaid('')
    setShowPayment(false)
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }

  // Calculate totals
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.12 // 12% VAT
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  const getChange = () => {
    const paid = parseFloat(amountPaid) || 0
    return Math.max(0, paid - getTotal())
  }

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) return
    
    const paid = parseFloat(amountPaid) || 0
    const total = getTotal()
    
    if (paymentMethod === 'cash' && paid < total) {
      alert('Insufficient payment amount!')
      return
    }

    setIsProcessing(true)

    try {
      // Update inventory for each item
      for (const item of cart) {
        const { error } = await supabase
          .from('inventory_items')
          .update({ stock: item.maxStock - item.quantity })
          .eq('id', item.id)
        
        if (error) throw error
      }

      // Create sale record (you might want to create a sales table)
      const sale: Sale = {
        items: cart,
        subtotal: getSubtotal(),
        tax: getTax(),
        total: total,
        amountPaid: paid,
        change: getChange(),
        paymentMethod: paymentMethod
      }

      setCurrentSale(sale)
      setShowReceipt(true)
      setShowPayment(false)
      setCart([])
      setAmountPaid('')

      // Reload items to update stock
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('stock', 0)
        .order('product_name', { ascending: true })
      
      if (!error) {
        setItems(data || [])
      }

    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error processing sale. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter items for search
  const filteredItems = items.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.barcode && item.barcode.includes(searchTerm))
  )

  if (loading) {
    return (
      <ProtectedRoute requiredRole="employee">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading POS system...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="employee">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Items in cart: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
                <button
                  onClick={clearCart}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Product Search & Barcode */}
            <div className="lg:col-span-2 space-y-6">
              {/* Barcode Scanner */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  Barcode Scanner
                </h2>
                <form onSubmit={handleBarcodeSubmit} className="flex space-x-2">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan barcode or enter product ID..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Product Search */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Product Search
                </h2>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                />
                
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredItems.slice(0, 20).map(item => (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="text-left p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{item.product_name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                        <div className="text-lg font-bold text-green-600">₱{item.price.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">Stock: {item.stock}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Cart & Checkout */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Current Sale
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items in cart</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                        <div className="text-green-600 font-semibold">₱{item.price.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:text-red-700 ml-2"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              {cart.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₱{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (12%):</span>
                    <span>₱{getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">₱{getTotal().toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center"
                  >
                    <CalculatorIcon className="h-5 w-5 mr-2" />
                    Process Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50"></div>
              <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Process Payment</h3>
                  <button onClick={() => setShowPayment(false)}>
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Total */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-center text-green-600">
                      ₱{getTotal().toFixed(2)}
                    </div>
                    <div className="text-center text-gray-600">Total Amount</div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                          className="mr-2"
                        />
                        <BanknotesIcon className="h-4 w-4 mr-1" />
                        <span>Cash</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="gcash"
                          checked={paymentMethod === 'gcash'}
                          onChange={(e) => setPaymentMethod(e.target.value as 'gcash')}
                          className="mr-2"
                        />
                        <CreditCardIcon className="h-4 w-4 mr-1" />
                        <span>GCash</span>
                      </label>
                    </div>
                  </div>

                  {/* Amount Paid (for cash) */}
                  {paymentMethod === 'cash' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Received
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                      />
                      {amountPaid && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <div className="text-lg font-semibold">
                            Change: ₱{getChange().toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Process Button */}
                  <button
                    onClick={processSale}
                    disabled={isProcessing || (paymentMethod === 'cash' && parseFloat(amountPaid) < getTotal())}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && currentSale && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50"></div>
              <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                <div className="text-center mb-4">
                  <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Sale Completed!</h3>
                </div>

                {/* Receipt */}
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <div className="text-center font-bold mb-4">
                    San Pedro Beach Resort<br />
                    SALES RECEIPT
                  </div>
                  
                  <div className="border-b border-gray-300 pb-2 mb-2">
                    {currentSale.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₱{currentSale.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (12%):</span>
                      <span>₱{currentSale.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>₱{currentSale.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment ({currentSale.paymentMethod}):</span>
                      <span>₱{currentSale.amountPaid.toFixed(2)}</span>
                    </div>
                    {currentSale.change > 0 && (
                      <div className="flex justify-between">
                        <span>Change:</span>
                        <span>₱{currentSale.change.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mt-4 text-xs text-gray-500">
                    {new Date().toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      setShowReceipt(false)
                      setCurrentSale(null)
                      if (barcodeInputRef.current) {
                        barcodeInputRef.current.focus()
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    New Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
