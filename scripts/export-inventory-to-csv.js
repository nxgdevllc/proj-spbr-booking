#!/usr/bin/env node

/**
 * Export Inventory to CSV Script
 * Exports current inventory data from Supabase to CSV format
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }

  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values that need quotes (contain commas, quotes, or newlines)
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Export inventory data to CSV
 */
async function exportInventoryToCSV() {
  try {
    console.log('📊 Fetching inventory data from Supabase...');
    
    // Fetch all inventory items
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    if (!items || items.length === 0) {
      console.log('⚠️  No inventory items found');
      return;
    }
    
    console.log(`✅ Found ${items.length} inventory items`);
    
    // Define CSV headers (matching your original INV1 format)
    const headers = [
      'id',
      'Product Name',
      'Price',
      'Size',
      'Units',
      'Category',
      'Min Level',
      'Stock',
      'count',
      're-stock Price',
      'Supplier',
      'Barcode/QR2-Data',
      'Barcode/QR2-Type',
      'Notes',
      'Tags',
      'Value',
      'Photo1',
      'Photo2',
      'Photo3',
      'Created At',
      'Updated At'
    ];
    
    // Transform data to match CSV format
    const csvData = items.map(item => ({
      'id': item.id,
      'Product Name': item.product_name,
      'Price': item.price,
      'Size': item.size || '',
      'Units': item.units || '',
      'Category': item.category,
      'Min Level': item.min_level || '',
      'Stock': item.stock,
      'count': item.stock, // Same as stock for consistency
      're-stock Price': item.restock_price || '',
      'Supplier': item.supplier || '',
      'Barcode/QR2-Data': item.barcode || '',
      'Barcode/QR2-Type': item.barcode_type || '',
      'Notes': item.notes || '',
      'Tags': item.tags || '',
      'Value': item.value || '',
      'Photo1': item.photo1 || '',
      'Photo2': item.photo2 || '',
      'Photo3': item.photo3 || '',
      'Created At': item.created_at || '',
      'Updated At': item.updated_at || ''
    }));
    
    // Generate CSV content
    const csvContent = arrayToCSV(csvData, headers);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `inventory_export_${timestamp}.csv`;
    const filepath = path.join(__dirname, '..', 'public', 'csv-exports', filename);
    
    // Ensure directory exists
    const exportDir = path.dirname(filepath);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Write CSV file
    fs.writeFileSync(filepath, csvContent, 'utf8');
    
    console.log(`✅ Inventory exported successfully!`);
    console.log(`📁 File saved: ${filepath}`);
    console.log(`📊 Total items: ${items.length}`);
    console.log(`💰 Total inventory value: ₱${items.reduce((sum, item) => sum + (item.value || 0), 0).toFixed(2)}`);
    
    // Generate summary report
    const summary = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.value || 0), 0),
      categories: [...new Set(items.map(item => item.category))].length,
      lowStockItems: items.filter(item => item.stock <= (item.min_level || 5)).length,
      outOfStockItems: items.filter(item => item.stock === 0).length,
      exportDate: new Date().toISOString(),
      filename: filename
    };
    
    console.log('\n📈 Inventory Summary:');
    console.log(`   • Total Items: ${summary.totalItems}`);
    console.log(`   • Categories: ${summary.categories}`);
    console.log(`   • Total Value: ₱${summary.totalValue.toFixed(2)}`);
    console.log(`   • Low Stock Items: ${summary.lowStockItems}`);
    console.log(`   • Out of Stock Items: ${summary.outOfStockItems}`);
    
    // Save summary as JSON
    const summaryFile = filepath.replace('.csv', '_summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`📋 Summary saved: ${summaryFile}`);
    
    return { filepath, summary };
    
  } catch (error) {
    console.error('❌ Error exporting inventory:', error);
    throw error;
  }
}

/**
 * Export specific categories only
 */
async function exportInventoryByCategory(category) {
  try {
    console.log(`📊 Fetching ${category} inventory data...`);
    
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('category', category)
      .order('product_name', { ascending: true });
    
    if (error) throw error;
    
    if (!items || items.length === 0) {
      console.log(`⚠️  No items found in category: ${category}`);
      return;
    }
    
    console.log(`✅ Found ${items.length} items in ${category}`);
    
    // Use same headers as full export
    const headers = [
      'id',
      'Product Name',
      'Price',
      'Size',
      'Units',
      'Category',
      'Min Level',
      'Stock',
      'count',
      're-stock Price',
      'Supplier',
      'Barcode/QR2-Data',
      'Barcode/QR2-Type',
      'Notes',
      'Tags',
      'Value',
      'Photo1',
      'Photo2',
      'Photo3',
      'Created At',
      'Updated At'
    ];
    
    const csvData = items.map(item => ({
      'id': item.id,
      'Product Name': item.product_name,
      'Price': item.price,
      'Size': item.size || '',
      'Units': item.units || '',
      'Category': item.category,
      'Min Level': item.min_level || '',
      'Stock': item.stock,
      'count': item.stock,
      're-stock Price': item.restock_price || '',
      'Supplier': item.supplier || '',
      'Barcode/QR2-Data': item.barcode || '',
      'Barcode/QR2-Type': item.barcode_type || '',
      'Notes': item.notes || '',
      'Tags': item.tags || '',
      'Value': item.value || '',
      'Photo1': item.photo1 || '',
      'Photo2': item.photo2 || '',
      'Photo3': item.photo3 || '',
      'Created At': item.created_at || '',
      'Updated At': item.updated_at || ''
    }));
    
    const csvContent = arrayToCSV(csvData, headers);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const safeCategory = category.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `inventory_${safeCategory}_${timestamp}.csv`;
    const filepath = path.join(__dirname, '..', 'public', 'csv-exports', filename);
    
    const exportDir = path.dirname(filepath);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, csvContent, 'utf8');
    
    console.log(`✅ ${category} inventory exported!`);
    console.log(`📁 File: ${filepath}`);
    
    return filepath;
    
  } catch (error) {
    console.error(`❌ Error exporting ${category} inventory:`, error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    if (command === 'category' && args[1]) {
      await exportInventoryByCategory(args[1]);
    } else {
      await exportInventoryToCSV();
    }
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { exportInventoryToCSV, exportInventoryByCategory };
