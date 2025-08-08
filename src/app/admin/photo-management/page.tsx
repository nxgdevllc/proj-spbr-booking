'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PhotoUpload from '@/components/PhotoUpload'
import Image from 'next/image'
import { PhotoIcon, EyeIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface InventoryItem {
  id: number
  product_name: string
  category: string
  stock: number
  price: number
  photo1?: string | null
  photo2?: string | null
  photo3?: string | null
}

export default function PhotoManagementPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedItem] = useState<InventoryItem | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [photoModalUrl, setPhotoModalUrl] = useState('')

  // Load all inventory items
  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('id, product_name, category, stock, price, photo1, photo2, photo3')
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

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))]

  // Handle photo upload
  const handlePhotoUploaded = (productId: number, photoNumber: number, photoUrl: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, [`photo${photoNumber}`]: photoUrl }
          : item
      )
    )
  }

  // Handle photo deletion
  const handlePhotoDeleted = (productId: number, photoNumber: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, [`photo${photoNumber}`]: null }
          : item
      )
    )
  }

  // Open photo modal
  const openPhotoModal = (photoUrl: string) => {
    setPhotoModalUrl(photoUrl)
    setShowPhotoModal(true)
  }

  // Get photo statistics
  const getPhotoStats = () => {
    const totalProducts = items.length
    const productsWithPhotos = items.filter(item => item.photo1 || item.photo2 || item.photo3).length
    const totalPhotos = items.reduce((sum, item) => 
      sum + (item.photo1 ? 1 : 0) + (item.photo2 ? 1 : 0) + (item.photo3 ? 1 : 0), 0
    )
    const productsWithOnePhoto = items.filter(item => 
      (item.photo1 && !item.photo2 && !item.photo3) ||
      (!item.photo1 && item.photo2 && !item.photo3) ||
      (!item.photo1 && !item.photo2 && item.photo3)
    ).length
    const productsWithTwoPhotos = items.filter(item => 
      ((item.photo1 && item.photo2 && !item.photo3) ||
       (item.photo1 && !item.photo2 && item.photo3) ||
       (!item.photo1 && item.photo2 && item.photo3))
    ).length
    const productsWithThreePhotos = items.filter(item => 
      item.photo1 && item.photo2 && item.photo3
    ).length

    return {
      totalProducts,
      productsWithPhotos,
      totalPhotos,
      productsWithOnePhoto,
      productsWithTwoPhotos,
      productsWithThreePhotos
    }
  }

  const stats = getPhotoStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo Management</h1>
          <p className="text-gray-600">Upload and manage product photos for your inventory</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.productsWithPhotos}</div>
            <div className="text-sm text-gray-600">With Photos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPhotos}</div>
            <div className="text-sm text-gray-600">Total Photos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.productsWithOnePhoto}</div>
            <div className="text-sm text-gray-600">1 Photo</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.productsWithTwoPhotos}</div>
            <div className="text-sm text-gray-600">2 Photos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.productsWithThreePhotos}</div>
            <div className="text-sm text-gray-600">3 Photos</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product name or category..."
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('All')
                }}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Product Header */}
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.product_name}</h3>
                <p className="text-xs text-gray-500">{item.category}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-green-600 font-bold">₱{item.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">Stock: {item.stock}</span>
                </div>
              </div>

              {/* Photo Upload Areas */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {/* Photo 1 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Photo 1</label>
                    <PhotoUpload
                      productId={item.id}
                      photoNumber={1}
                      currentPhotoUrl={item.photo1}
                      onPhotoUploaded={(url) => handlePhotoUploaded(item.id, 1, url)}
                      onPhotoDeleted={() => handlePhotoDeleted(item.id, 1)}
                      className="h-24"
                    />
                  </div>

                  {/* Photo 2 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Photo 2</label>
                    <PhotoUpload
                      productId={item.id}
                      photoNumber={2}
                      currentPhotoUrl={item.photo2}
                      onPhotoUploaded={(url) => handlePhotoUploaded(item.id, 2, url)}
                      onPhotoDeleted={() => handlePhotoDeleted(item.id, 2)}
                      className="h-24"
                    />
                  </div>

                  {/* Photo 3 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Photo 3</label>
                    <PhotoUpload
                      productId={item.id}
                      photoNumber={3}
                      currentPhotoUrl={item.photo3}
                      onPhotoUploaded={(url) => handlePhotoUploaded(item.id, 3, url)}
                      onPhotoDeleted={() => handlePhotoDeleted(item.id, 3)}
                      className="h-24"
                    />
                  </div>
                </div>

                {/* Photo Preview */}
                <div className="grid grid-cols-3 gap-2">
                  {[item.photo1, item.photo2, item.photo3].map((photo, index) => (
                    <div key={index} className="relative">
                      {photo ? (
                        <div className="relative group">
                          <Image
                            src={photo}
                            alt={`Product photo ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            onClick={() => openPhotoModal(photo)}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <EyeIcon className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found matching your search</p>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-75" onClick={() => setShowPhotoModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={photoModalUrl}
                alt="Product photo"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setShowPhotoModal(false)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
