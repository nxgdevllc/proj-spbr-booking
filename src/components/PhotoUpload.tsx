'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { PhotoIcon, XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface PhotoUploadProps {
  productId: number
  photoNumber: 1 | 2 | 3
  currentPhotoUrl?: string | null
  onPhotoUploaded: (photoUrl: string) => void
  onPhotoDeleted: () => void
  className?: string
}

export default function PhotoUpload({
  productId,
  photoNumber,
  currentPhotoUrl,
  onPhotoUploaded,
  onPhotoDeleted,
  className = ''
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null)



  const uploadPhoto = useCallback(async (file: File) => {
    const generateFileName = (file: File) => {
      const extension = file.name.split('.').pop()
      const timestamp = Date.now()
      return `product-${productId}-photo-${photoNumber}-${timestamp}.${extension}`
    }
    if (!file) return

    setIsUploading(true)
    try {
      const fileName = generateFileName(file)
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('product-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-photos')
        .getPublicUrl(fileName)

      const photoUrl = urlData.publicUrl

      // Update database
      const updateData: Record<string, string> = {}
      updateData[`photo${photoNumber}`] = photoUrl

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', productId)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw updateError
      }

      setPreviewUrl(photoUrl)
      onPhotoUploaded(photoUrl)
      
    } catch (error) {
      console.error('Photo upload failed:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [productId, photoNumber, onPhotoUploaded])

  const deletePhoto = useCallback(async () => {
    if (!currentPhotoUrl) return

    setIsUploading(true)
    try {
      // Extract filename from URL
      const urlParts = currentPhotoUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('product-photos')
        .remove([fileName])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        throw storageError
      }

      // Update database
      const updateData: Record<string, null> = {}
      updateData[`photo${photoNumber}`] = null

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', productId)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw updateError
      }

      setPreviewUrl(null)
      onPhotoDeleted()
      
    } catch (error) {
      console.error('Photo deletion failed:', error)
      alert('Failed to delete photo. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [currentPhotoUrl, productId, photoNumber, onPhotoDeleted])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadPhoto(e.dataTransfer.files[0])
    }
  }, [uploadPhoto])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadPhoto(e.target.files[0])
    }
  }, [uploadPhoto])

  return (
    <div className={`relative ${className}`}>
      {/* Photo Display */}
      {previewUrl ? (
        <div className="relative group">
          <Image
            src={previewUrl}
            alt={`Product photo ${photoNumber}`}
            width={200}
            height={200}
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          
          {/* Delete button overlay */}
          <button
            onClick={deletePhoto}
            disabled={isUploading}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          
          {/* Uploading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-sm">Processing...</div>
            </div>
          )}
        </div>
      ) : (
        /* Upload Area */
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            dragActive 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            ) : (
              <>
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                <PhotoIcon className="h-6 w-6 text-gray-400" />
              </>
            )}
            
            <div className="text-sm text-gray-600">
              {isUploading ? (
                'Uploading...'
              ) : (
                <>
                  <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                  <br />
                  <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
