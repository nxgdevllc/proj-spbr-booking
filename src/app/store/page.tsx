'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhotoIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface InventoryItem {
  id: number
  category: string
  product_name: string
  stock: number
  size: string | null
  units: string | null
  price: number
  min_level: number | null
  supplier: string | null
  barcode: string | null
  barcode_type: string | null
  notes: string | null
  tags: string | null
  restock_price: number | null
  value: number | null
  photo1?: string | null
  photo2?: string | null
  photo3?: string | null
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  maxStock: number
}

const ITEMS_PER_PAGE = 20

export default function StorePage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [displayedItems, setDisplayedItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCart, setShowCart] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [orderType, setOrderType] = useState<'pickup' | 'gcash'>('pickup')

  // Load all items initially
  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .gt('stock', 0) // Only show items in stock
          .order('category', { ascending: true })
          .order('id', { ascending: true }) // Ensure consistent ordering
        
        if (error) throw error
        
        // Remove any duplicate items based on ID
        const uniqueItems = (data || []).filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        )
        setItems(uniqueItems)
      } catch (error) {
        console.error('Error loading items:', error)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, selectedCategory])

  // Load more items (infinite scroll)
  const loadMoreItems = useCallback(() => {
    if (loadingMore) return
    
    // Check if all items are already displayed
    if (displayedItems.length >= filteredItems.length) {
      return
    }
    
    setLoadingMore(true)
    const nextPage = currentPage + 1
    const startIndex = nextPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const newItems = filteredItems.slice(startIndex, endIndex)
    
    // Double-check that we have new items to add
    if (newItems.length === 0) {
      setLoadingMore(false)
      return
    }
    
    setTimeout(() => {
      setDisplayedItems(prev => {
        // Create a Set of existing IDs to avoid duplicates
        const existingIds = new Set(prev.map(item => item.id))
        const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id))
        return [...prev, ...uniqueNewItems]
      })
      setCurrentPage(nextPage)
      setLoadingMore(false)
    }, 200) // Faster loading for better UX
  }, [currentPage, filteredItems, loadingMore, displayedItems.length])

  // Reset displayed items when filters change
  useEffect(() => {
    const initialItems = filteredItems.slice(0, ITEMS_PER_PAGE)
    // Ensure no duplicates in initial items
    const uniqueInitialItems = initialItems.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )
    setDisplayedItems(uniqueInitialItems)
    setCurrentPage(0)
  }, [filteredItems])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Stop loading if all items are already displayed
      if (displayedItems.length >= filteredItems.length) {
        return
      }
      
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMoreItems()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMoreItems, displayedItems.length, filteredItems.length])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(item => item.category)))
    return ['All', ...cats.sort()]
  }, [items])

  // Cart functions
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
        }
        return prev
      }
      return [...prev, {
        id: item.id,
        name: item.product_name,
        price: item.price,
        quantity: 1,
        maxStock: item.stock
      }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

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

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Get appropriate icon for each category
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Food Packs': '🍔',
      'Cold Beverages': '🥤',
      'Hot Beverages': '☕',
      'Toiletries': '🧴',
      'Beach & Swimming': '🏖️',
      'Snacks': '🍿',
      'Canned Goods': '🥫',
      'Condiments': '🧂',
      'Household': '🏠'
    }
    return iconMap[category] || '📦'
  }

  const handleCheckout = () => {
    if (orderType === 'gcash') {
      // Redirect to GCash payment page with order data
      const itemsParam = encodeURIComponent(JSON.stringify(cart))
      const totalParam = getTotalPrice().toFixed(2)
      window.location.href = `/store/gcash-payment?items=${itemsParam}&total=${totalParam}`
    } else {
      // Cash payment - show pickup instructions
      alert(`Order placed for ₱${getTotalPrice().toFixed(2)} - Pay at Pickup`)
      setCart([])
      setShowCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-yellow-600">🏖️</span>
              <span className="ml-2 text-xl font-bold text-green-600">SPBR Store</span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Cart */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Category Filter */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-600">Browse our products by category</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map(category => {
              const categoryItems = items.filter(item => item.category === category)
              const itemCount = categoryItems.length
              const categoryIcon = getCategoryIcon(category)
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    selectedCategory === category
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl transition-colors ${
                      selectedCategory === category
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
                    }`}>
                      {categoryIcon}
                    </div>
                    <h3 className={`font-semibold text-sm mb-1 transition-colors ${
                      selectedCategory === category
                        ? 'text-green-700'
                        : 'text-gray-900 group-hover:text-green-700'
                    }`}>
                      {category}
                    </h3>
                    <p className={`text-xs transition-colors ${
                      selectedCategory === category
                        ? 'text-green-600'
                        : 'text-gray-500 group-hover:text-green-600'
                    }`}>
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  
                  {selectedCategory === category && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Show All Categories Button */}
          <div className="text-center mt-6">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedCategory === 'All'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 hover:shadow-md'
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Show All Categories ({items.length} items)
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displayedItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative">
                {item.photo1 ? (
                  <Image
                    src={item.photo1}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {item.stock <= (item.min_level || 5) && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Low Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {item.product_name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-green-600">
                      ₱{item.price.toFixed(2)}
                    </span>
                    {item.size && (
                      <span className="text-xs text-gray-500 ml-1">
                        / {item.size}{item.units}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Stock: {item.stock}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  disabled={item.stock === 0}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Loading More */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              Loading more products... ({displayedItems.length} of {filteredItems.length} shown)
            </p>
            <div className="mt-2 w-48 bg-gray-200 rounded-full h-2 mx-auto">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(displayedItems.length / filteredItems.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* All Products Loaded */}
        {displayedItems.length >= filteredItems.length && filteredItems.length > 0 && (
          <div className="text-center py-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-green-600 text-2xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">All Products Loaded</h3>
              <p className="text-green-700">You&apos;ve seen all {filteredItems.length} products in this category</p>
              <p className="text-sm text-green-600 mt-2">Infinite scroll disabled - no more loading</p>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="mt-3 text-sm text-green-600 hover:text-green-800 underline"
                >
                  View all categories
                </button>
              )}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your search</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
                <button onClick={() => setShowCart(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={`cart-${item.id}-${index}`} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                          <p className="text-green-600 font-semibold">₱{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment & Pickup
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="pickup"
                          checked={orderType === 'pickup'}
                          onChange={(e) => setOrderType(e.target.value as 'pickup')}
                          className="mr-2"
                        />
                        <BanknotesIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">Pay at Store (Cash)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="gcash"
                          checked={orderType === 'gcash'}
                          onChange={(e) => setOrderType(e.target.value as 'gcash')}
                          className="mr-2"
                        />
                        <CreditCardIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">Pay with GCash</span>
                      </label>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">₱{getTotalPrice().toFixed(2)}</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    {orderType === 'gcash' ? 'Pay with GCash' : 'Place Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
