#!/usr/bin/env node

/**
 * Open Food Facts Scraper
 * Scrapes product data from Open Food Facts and imports into Supabase
 * 
 * Usage:
 * node scripts/scrape-openfoodfacts.js [barcode] [--all]
 * 
 * Examples:
 * node scripts/scrape-openfoodfacts.js 4800016641503
 * node scripts/scrape-openfoodfacts.js --all
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Open Food Facts API endpoints
const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v0'
const OPENFOODFACTS_PH_API = 'https://ph.openfoodfacts.org/api/v0'

class OpenFoodFactsScraper {
  constructor() {
    this.downloadedImages = new Set()
    this.importedProducts = []
    this.errors = []
  }

  /**
   * Main scraping function
   */
  async scrape(barcode = null, scrapeAll = false) {
    console.log('🚀 Starting Open Food Facts scraper...')
    
    if (scrapeAll) {
      await this.scrapeAllProducts()
    } else if (barcode) {
      await this.scrapeProduct(barcode)
    } else {
      console.log('❌ Please provide a barcode or use --all flag')
      return
    }

    this.generateReport()
  }

  /**
   * Scrape a single product by barcode
   */
  async scrapeProduct(barcode) {
    console.log(`📦 Scraping product with barcode: ${barcode}`)
    
    try {
      // Try Philippines API first, then world API
      let productData = await this.fetchProductData(barcode, OPENFOODFACTS_PH_API)
      
      if (!productData || productData.status === 0) {
        console.log('⚠️  Product not found in PH database, trying world database...')
        productData = await this.fetchProductData(barcode, OPENFOODFACTS_API)
      }

      if (!productData || productData.status === 0) {
        throw new Error(`Product not found: ${barcode}`)
      }

      const product = productData.product
      console.log(`✅ Found product: ${product.product_name || 'Unknown'}`)

      // Process and import the product
      await this.processProduct(product)
      
    } catch (error) {
      console.error(`❌ Error scraping product ${barcode}:`, error.message)
      this.errors.push({ barcode, error: error.message })
    }
  }

  /**
   * Scrape all products from a predefined list or search
   */
  async scrapeAllProducts() {
    console.log('🌍 Scraping all available products...')
    
    // You can define a list of barcodes to scrape
    const barcodesToScrape = [
      '4800016641503', // Jack & Jill Chippy
      // Add more barcodes here
    ]

    for (const barcode of barcodesToScrape) {
      await this.scrapeProduct(barcode)
      // Add delay to be respectful to the API
      await this.delay(1000)
    }
  }

  /**
   * Fetch product data from Open Food Facts API
   */
  async fetchProductData(barcode, apiUrl) {
    const url = `${apiUrl}/product/${barcode}.json`
    console.log(`🔍 Fetching from: ${url}`)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  /**
   * Process and import a product
   */
  async processProduct(product) {
    try {
      // Extract product information
      const productInfo = this.extractProductInfo(product)
      
      // Check if product already exists
      const existingProduct = await this.checkExistingProduct(productInfo.barcode)
      
      if (existingProduct) {
        console.log(`⚠️  Product already exists: ${productInfo.product_name}`)
        return
      }

      // Download and upload images
      const photoUrls = await this.processImages(product)

      // Prepare data for database
      const insertData = {
        ...productInfo,
        photo1: photoUrls.photo1 || null,
        photo2: photoUrls.photo2 || null,
        photo3: photoUrls.photo3 || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert into database
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(insertData)
        .select()

      if (error) {
        throw error
      }

      console.log(`✅ Successfully imported: ${productInfo.product_name}`)
      this.importedProducts.push({
        id: data[0].id,
        name: productInfo.product_name,
        barcode: productInfo.barcode
      })

    } catch (error) {
      console.error(`❌ Error processing product:`, error.message)
      this.errors.push({ product: product.product_name, error: error.message })
    }
  }

  /**
   * Extract product information from Open Food Facts data
   */
  extractProductInfo(product) {
    return {
      product_name: product.product_name || product.generic_name || 'Unknown Product',
      category: this.mapCategory(product.categories_tags || []),
      stock: 0, // Default stock
      size: product.quantity || null,
      units: this.extractUnits(product.quantity),
      price: 0, // Default price - you'll need to set this manually
      min_level: 5, // Default minimum stock level
      supplier: product.brands || 'Unknown',
      barcode: product.code || null,
      barcode_type: 'EAN-13', // Most common for retail products
      notes: this.generateNotes(product),
      tags: product.labels_tags?.join(', ') || null,
      restock_price: 0, // Default restock price
      value: 0 // Will be calculated by trigger
    }
  }

  /**
   * Map Open Food Facts categories to your categories
   */
  mapCategory(categories) {
    const categoryMapping = {
      'en:snacks': 'Snacks',
      'en:salty-snacks': 'Snacks',
      'en:chips-and-fries': 'Snacks',
      'en:crisps': 'Snacks',
      'en:corn-chips': 'Snacks',
      'en:beverages': 'Beverages',
      'en:soft-drinks': 'Beverages',
      'en:juices': 'Beverages',
      'en:candies': 'Candies',
      'en:chocolates': 'Candies',
      'en:cookies': 'Snacks',
      'en:crackers': 'Snacks',
      'en:noodles': 'Food',
      'en:instant-noodles': 'Food',
      'en:condiments': 'Condiments',
      'en:sauces': 'Condiments',
      'en:spreads': 'Condiments'
    }

    for (const category of categories) {
      if (categoryMapping[category]) {
        return categoryMapping[category]
      }
    }

    return 'Other' // Default category
  }

  /**
   * Extract units from quantity string
   */
  extractUnits(quantity) {
    if (!quantity) return null
    
    const unitMatch = quantity.match(/(g|kg|ml|l|oz|lb)$/i)
    return unitMatch ? unitMatch[1].toLowerCase() : null
  }

  /**
   * Generate notes from product information
   */
  generateNotes(product) {
    const notes = []
    
    if (product.ingredients_text) {
      notes.push(`Ingredients: ${product.ingredients_text}`)
    }
    
    if (product.allergens_tags?.length > 0) {
      notes.push(`Allergens: ${product.allergens_tags.join(', ')}`)
    }
    
    if (product.nutrition_grade_fr) {
      notes.push(`Nutrition Grade: ${product.nutrition_grade_fr.toUpperCase()}`)
    }
    
    if (product.manufacturing_places) {
      notes.push(`Manufactured in: ${product.manufacturing_places}`)
    }
    
    return notes.length > 0 ? notes.join(' | ') : 'Imported from Open Food Facts'
  }

  /**
   * Process and upload product images
   */
  async processImages(product) {
    const photoUrls = {}
    const imageUrls = []

    // Collect all available image URLs
    if (product.image_front_url) imageUrls.push({ url: product.image_front_url, type: 'photo1' })
    if (product.image_ingredients_url) imageUrls.push({ url: product.image_ingredients_url, type: 'photo2' })
    if (product.image_nutrition_url) imageUrls.push({ url: product.image_nutrition_url, type: 'photo3' })
    if (product.image_packaging_url) imageUrls.push({ url: product.image_packaging_url, type: 'photo2' })

    // Download and upload images (max 3)
    for (let i = 0; i < Math.min(imageUrls.length, 3); i++) {
      const { url, type } = imageUrls[i]
      
      try {
        const uploadedUrl = await this.downloadAndUploadImage(url, product.code, i + 1)
        if (uploadedUrl) {
          photoUrls[type] = uploadedUrl
        }
      } catch (error) {
        console.error(`❌ Error processing image ${url}:`, error.message)
      }
    }

    return photoUrls
  }

  /**
   * Download image from URL and upload to Supabase Storage
   */
  async downloadAndUploadImage(imageUrl, productCode, photoNumber) {
    if (!imageUrl || this.downloadedImages.has(imageUrl)) {
      return null
    }

    try {
      console.log(`📸 Downloading image: ${imageUrl}`)
      
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }

      const buffer = await response.buffer()
      const contentType = response.headers.get('content-type') || 'image/jpeg'
      const extension = this.getExtensionFromContentType(contentType)
      
      // Generate filename
      const filename = `product-${productCode}-photo-${photoNumber}-${Date.now()}.${extension}`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-photos')
        .upload(filename, buffer, {
          contentType,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-photos')
        .getPublicUrl(filename)

      this.downloadedImages.add(imageUrl)
      console.log(`✅ Image uploaded: ${filename}`)
      
      return urlData.publicUrl

    } catch (error) {
      console.error(`❌ Error uploading image:`, error.message)
      return null
    }
  }

  /**
   * Get file extension from content type
   */
  getExtensionFromContentType(contentType) {
    const mapping = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    }
    return mapping[contentType] || 'jpg'
  }

  /**
   * Check if product already exists in database
   */
  async checkExistingProduct(barcode) {
    if (!barcode) return false
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, product_name')
      .eq('barcode', barcode)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing product:', error)
    }

    return data
  }

  /**
   * Generate import report
   */
  generateReport() {
    console.log('\n📊 IMPORT REPORT')
    console.log('='.repeat(50))
    
    console.log(`✅ Successfully imported: ${this.importedProducts.length} products`)
    this.importedProducts.forEach(product => {
      console.log(`  - ${product.name} (ID: ${product.id}, Barcode: ${product.barcode})`)
    })
    
    console.log(`📸 Downloaded images: ${this.downloadedImages.size}`)
    
    if (this.errors.length > 0) {
      console.log(`❌ Errors: ${this.errors.length}`)
      this.errors.forEach(error => {
        console.log(`  - ${error.product || error.barcode}: ${error.error}`)
      })
    }
    
    console.log('='.repeat(50))
  }

  /**
   * Utility function to add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const barcode = args[0]
  const scrapeAll = args.includes('--all')

  const scraper = new OpenFoodFactsScraper()
  
  try {
    await scraper.scrape(barcode, scrapeAll)
  } catch (error) {
    console.error('❌ Scraping failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default OpenFoodFactsScraper
