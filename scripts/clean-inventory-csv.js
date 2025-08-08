#!/usr/bin/env node

/**
 * Clean Inventory CSV Script
 * Fixes problematic rows by adding default values and explanatory notes in INV1.csv
 */

const fs = require('fs');
const path = require('path');

function cleanInventoryCSV() {
  const inputPath = path.join(__dirname, '../public/csv-imports/INV1.csv');
  const outputPath = path.join(__dirname, '../public/csv-imports/INV1_cleaned.csv');
  
  console.log('🧹 Cleaning INV1.csv file...');
  
  try {
    const content = fs.readFileSync(inputPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const header = lines[0];
    const dataLines = lines.slice(1);
    
    console.log(`📊 Original file: ${dataLines.length} data rows`);
    
    const cleanedLines = [];
    let fixedCount = 0;
    
    dataLines.forEach((line, index) => {
      // Use a more robust CSV parsing that handles quoted fields
      const values = parseCSVLine(line);
      const rowNumber = index + 2; // +2 because we start from line 2 and want 1-based indexing
      
      // Fix specific problematic rows
      let needsFix = false;
      let fixNote = '';
      
      // Row 233: Missing stock value
      if (rowNumber === 233) {
        values[7] = '0'; // Set stock to 0
        fixNote = 'Stock set to 0 - missing in original data';
        needsFix = true;
      }
      
      // Row 235: Missing price, category, and stock
      if (rowNumber === 235) {
        values[2] = '0'; // Set price to 0
        values[5] = 'Toiletries'; // Set category based on product name
        values[7] = '0'; // Set stock to 0
        fixNote = 'Price set to 0, category set to Toiletries, stock set to 0 - missing in original data';
        needsFix = true;
      }
      
      // Row 242: Missing stock value
      if (rowNumber === 242) {
        values[7] = '0'; // Set stock to 0
        fixNote = 'Stock set to 0 - missing in original data';
        needsFix = true;
      }
      
      // Row 244: Missing price and category
      if (rowNumber === 244) {
        values[2] = '0'; // Set price to 0
        values[5] = 'Snacks'; // Set category based on product name
        fixNote = 'Price set to 0, category set to Snacks - missing in original data';
        needsFix = true;
      }
      
      // Check for other rows with missing required fields and fix them
      const productName = values[1] || '';
      const price = values[2] || '';
      const category = values[5] || '';
      const stock = values[7] || '';
      
      if (!productName) {
        // Try to extract product name from other fields or use a default
        if (values[1] && values[1].trim() !== '') {
          // Product name is in the second column
          values[1] = values[1].trim();
        } else if (values[2] && values[2].trim() !== '' && !isNaN(values[2])) {
          // If second column is empty but third column has a number (price), 
          // the product name might be missing - use a default
          values[1] = `Product ${values[0]}`;
          fixNote = 'Product name was missing, assigned default name';
          needsFix = true;
        } else {
          console.log(`❌ Row ${rowNumber}: Missing product name - cannot fix, skipping`);
          return;
        }
      }
      
      if (!price) {
        values[2] = '0';
        fixNote = 'Price set to 0 - missing in original data';
        needsFix = true;
      }
      
      if (!category) {
        // Try to determine category from product name
        const productLower = productName.toLowerCase();
        if (productLower.includes('rice') || productLower.includes('noodle') || productLower.includes('sardine') || productLower.includes('tuna') || productLower.includes('beef')) {
          values[5] = 'Food Packs';
        } else if (productLower.includes('coffee') || productLower.includes('tea') || productLower.includes('milk') || productLower.includes('energen')) {
          values[5] = 'Hot Beverages';
        } else if (productLower.includes('coke') || productLower.includes('sprite') || productLower.includes('water') || productLower.includes('juice') || productLower.includes('gatorade')) {
          values[5] = 'Cold Beverages';
        } else if (productLower.includes('beer') || productLower.includes('rhum') || productLower.includes('vodka') || productLower.includes('gin') || productLower.includes('brandy')) {
          values[5] = 'Alcoholic Beverages';
        } else if (productLower.includes('soap') || productLower.includes('shampoo') || productLower.includes('toothpaste') || productLower.includes('deodorant') || productLower.includes('pad') || productLower.includes('diaper')) {
          values[5] = 'Toiletries';
        } else if (productLower.includes('cigarette') || productLower.includes('marlboro') || productLower.includes('more') || productLower.includes('winston')) {
          values[5] = 'Cigarettes';
        } else if (productLower.includes('cup') || productLower.includes('plate') || productLower.includes('spoon') || productLower.includes('knife') || productLower.includes('glove') || productLower.includes('tray')) {
          values[5] = 'Supplies';
        } else if (productLower.includes('chip') || productLower.includes('cracker') || productLower.includes('candy') || productLower.includes('snack')) {
          values[5] = 'Snacks';
        } else if (productLower.includes('oil') || productLower.includes('sauce') || productLower.includes('seasoning') || productLower.includes('ketchup') || productLower.includes('condiment')) {
          values[5] = 'Kitchen & Condiments';
        } else {
          values[5] = 'Uncategorized';
        }
        fixNote = `Category set to "${values[5]}" - missing in original data`;
        needsFix = true;
      }
      
      if (!stock) {
        values[7] = '0';
        fixNote = fixNote ? `${fixNote}; Stock set to 0 - missing in original data` : 'Stock set to 0 - missing in original data';
        needsFix = true;
      }
      
      // Fix category issues
      if (values[5] === 'Cold Beverages' && productName.toLowerCase().includes('rice')) {
        values[5] = 'Food Packs';
        fixNote = fixNote ? `${fixNote}; Category changed from "Cold Beverages" to "Food Packs" for rice product` : 'Category changed from "Cold Beverages" to "Food Packs" for rice product';
        needsFix = true;
      }
      
      // Add fix note to notes column if there was a fix
      if (needsFix) {
        const currentNotes = values[11] || '';
        const separator = currentNotes ? '; ' : '';
        values[11] = `${currentNotes}${separator}${fixNote}`;
        fixedCount++;
        console.log(`🔧 Fixed row ${rowNumber}: ${fixNote}`);
      }
      
      // Ensure we have exactly 18 columns
      while (values.length < 18) {
        values.push('');
      }
      if (values.length > 18) {
        values.splice(18);
      }
      
      cleanedLines.push(values.join(','));
    });
    
    // Write cleaned file
    const cleanedContent = [header, ...cleanedLines].join('\n');
    fs.writeFileSync(outputPath, cleanedContent, 'utf8');
    
    console.log(`\n✅ Cleaning completed:`);
    console.log(`  - Original rows: ${dataLines.length}`);
    console.log(`  - Fixed rows: ${fixedCount}`);
    console.log(`  - Cleaned rows: ${cleanedLines.length}`);
    console.log(`  - Output file: INV1_cleaned.csv`);
    
    return outputPath;
    
  } catch (error) {
    console.error(`❌ Error cleaning CSV: ${error.message}`);
    return null;
  }
}

/**
 * Parse CSV line properly handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Run the script if called directly
if (require.main === module) {
  cleanInventoryCSV();
}

module.exports = { cleanInventoryCSV };
