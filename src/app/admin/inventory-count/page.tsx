'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'

interface InventoryItem {
  id: number
  category: string
  product_name: string
  stock: number
  price: number
  barcode: string | null
}

interface CountItem {
  id: number
  product_name: string
  category: string
  current_stock: number
  counted_stock: number
  difference: number
  notes?: string
}

interface InventoryCount {
  id?: number
  count_date: string
  status: 'in_progress' | 'completed'
  counted_by: string
  total_items: number
  items_counted: number
  discrepancies: number
  notes?: string
  items: CountItem[]
}

export default function InventoryCountPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [currentCount, setCurrentCount] = useState<InventoryCount | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [countedBy, setCountedBy] = useState('')

  // Load inventory items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('category', { ascending: true })
        
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

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category))).sort()

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Start new count
  const startNewCount = () => {
    if (!countedBy.trim()) {
      alert('Please enter who is performing the count')
      return
    }

    const newCount: InventoryCount = {
      count_date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      counted_by: countedBy,
      total_items: items.length,
      items_counted: 0,
      discrepancies: 0,
      notes: '',
      items: items.map(item => ({
        id: item.id,
        product_name: item.product_name,
        category: item.category,
        current_stock: item.stock,
        counted_stock: 0,
        difference: 0,
        notes: ''
      }))
    }

    setCurrentCount(newCount)
  }

  // Update counted stock for an item
  const updateCountedStock = (itemId: number, countedStock: number, notes?: string) => {
    if (!currentCount) return

    setCurrentCount(prev => {
      if (!prev) return prev

      const updatedItems = prev.items.map(item => {
        if (item.id === itemId) {
          const difference = countedStock - item.current_stock
          return {
            ...item,
            counted_stock: countedStock,
            difference: difference,
            notes: notes || ''
          }
        }
        return item
      })

      const itemsCounted = updatedItems.filter(item => item.counted_stock > 0 || item.counted_stock === 0).length
      const discrepancies = updatedItems.filter(item => item.difference !== 0).length

      return {
        ...prev,
        items: updatedItems,
        items_counted: itemsCounted,
        discrepancies: discrepancies
      }
    })
  }

  // Complete count and update inventory
  const completeCount = async () => {
    if (!currentCount) return

    try {
      // Update inventory stocks based on counted amounts
      for (const item of currentCount.items) {
        if (item.difference !== 0) {
          const { error } = await supabase
            .from('inventory_items')
            .update({ stock: item.counted_stock })
            .eq('id', item.id)
          
          if (error) throw error
        }
      }

      // TODO: Save count record to a inventory_counts table
      // const { error: countError } = await supabase
      //   .from('inventory_counts')
      //   .insert({
      //     count_date: currentCount.count_date,
      //     counted_by: currentCount.counted_by,
      //     total_items: currentCount.total_items,
      //     items_counted: currentCount.items_counted,
      //     discrepancies: currentCount.discrepancies,
      //     notes: currentCount.notes,
      //     items: currentCount.items
      //   })

      alert('Inventory count completed successfully!')
      
      // Reload items with updated stock
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('category', { ascending: true })
      
      if (!error) {
        setItems(data || [])
      }

      setCurrentCount(null)
      setCountedBy('')

    } catch (error) {
      console.error('Error completing count:', error)
      alert('Error completing count. Please try again.')
    }
  }

  // Cancel current count
  const cancelCount = () => {
    if (confirm('Are you sure you want to cancel this inventory count?')) {
      setCurrentCount(null)
      setCountedBy('')
    }
  }

  // Print count sheet
  const printCountSheet = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Count Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .count-col { width: 80px; }
            .notes-col { width: 150px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>San Pedro Beach Resort</h2>
            <h3>Monthly Inventory Count Sheet</h3>
          </div>
          <div class="info">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Counted By:</strong> _________________________</p>
            <p><strong>Verified By:</strong> _________________________</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th class="count-col">Counted</th>
                <th class="count-col">Difference</th>
                <th class="notes-col">Notes</th>
              </tr>
            </thead>
            <tbody>
              ${filteredItems.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.category}</td>
                  <td>${item.stock}</td>
                  <td class="count-col"></td>
                  <td class="count-col"></td>
                  <td class="notes-col"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px;">
            <p><strong>Summary:</strong></p>
            <p>Total Items: ${filteredItems.length}</p>
            <p>Items Counted: _______</p>
            <p>Discrepancies: _______</p>
            <p>Notes: _________________________________________________</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="manager">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="manager">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 mr-2" />
                Monthly Inventory Count
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={printCountSheet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print Count Sheet
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {!currentCount ? (
            /* Start New Count */
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Start New Inventory Count</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Counted By (Name)
                  </label>
                  <input
                    type="text"
                    value={countedBy}
                    onChange={(e) => setCountedBy(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Count Date
                  </label>
                  <input
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <button
                  onClick={startNewCount}
                  disabled={!countedBy.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Start Count
                </button>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{items.length}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ₱{items.reduce((sum, item) => sum + (item.stock * item.price), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Current Value</div>
                </div>
              </div>
            </div>
          ) : (
            /* Count in Progress */
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Inventory Count in Progress
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={completeCount}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Complete Count
                  </button>
                  <button
                    onClick={cancelCount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">{currentCount.items_counted}</div>
                  <div className="text-sm text-gray-600">Items Counted</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">{currentCount.total_items - currentCount.items_counted}</div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-yellow-600">{currentCount.discrepancies}</div>
                  <div className="text-sm text-gray-600">Discrepancies</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round((currentCount.items_counted / currentCount.total_items) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product name or category..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    {currentCount && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Counted Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Difference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map(item => {
                    const countItem = currentCount?.items.find(ci => ci.id === item.id)
                    
                    return (
                      <tr key={item.id} className={countItem?.difference !== 0 ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.product_name}</div>
                          {item.barcode && (
                            <div className="text-sm text-gray-500">Barcode: {item.barcode}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stock}
                        </td>
                        {currentCount && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                value={countItem?.counted_stock || ''}
                                onChange={(e) => updateCountedStock(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                countItem?.difference === 0 ? 'bg-green-100 text-green-800' :
                                (countItem?.difference || 0) > 0 ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {(countItem?.difference || 0) > 0 ? '+' : ''}{countItem?.difference || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={countItem?.notes || ''}
                                onChange={(e) => updateCountedStock(item.id, countItem?.counted_stock || 0, e.target.value)}
                                className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                placeholder="Notes..."
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
