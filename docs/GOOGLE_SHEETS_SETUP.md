# Google Sheets API Setup Guide

This guide will help you set up Google Sheets API integration to import your existing data into the San Pedro Beach Resort management system.

## 🎯 **Overview**

You have several options for importing your Google Sheets data:

1. **CSV Export** (Simplest) - Export sheets as CSV files
2. **Google Sheets API** (Recommended) - Direct integration
3. **Hybrid Approach** - Use both methods

## 📋 **Option 1: CSV Export (Quick Start)**

### Step 1: Export Your Sheets
1. Open your Google Sheets
2. Go to **File** → **Download** → **CSV**
3. Save each sheet as a separate CSV file
4. Use the Data Import Tool at `/admin/data-import`

### Step 2: Prepare Your Data
Ensure your CSV files have headers in the first row:

**Guests CSV Example:**
```csv
First Name,Last Name,Email,Phone,ID Number,Address,Nationality
John,Doe,john@email.com,+639123456789,123456789,Manila,Philippines
Jane,Smith,jane@email.com,+639987654321,987654321,Cebu,Philippines
```

**Bookings CSV Example:**
```csv
Booking Number,Guest ID,Unit ID,Check In Date,Check Out Date,Total Amount,Status
BK001,guest-123,unit-001,2024-01-15,2024-01-17,5000.00,confirmed
BK002,guest-456,unit-002,2024-01-20,2024-01-22,6000.00,pending
```

## 🔧 **Option 2: Google Sheets API (Recommended)**

### Step 1: Enable Google Sheets API

1. **Go to Google Cloud Console**
   - Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it: `San Pedro Beach Resort Data Import`
   - Click "Create"

3. **Enable Google Sheets API**
   - In the left sidebar, click "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click on it and click "Enable"

### Step 2: Create API Credentials

1. **Go to Credentials**
   - Click "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"

2. **Configure API Key**
   - Click on the created API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain: `https://your-vercel-domain.vercel.app/*`
   - Under "API restrictions", select "Restrict key"
   - Select "Google Sheets API"
   - Click "Save"

3. **Copy Your API Key**
   - Copy the API key (starts with `AIza...`)
   - Keep it secure - you'll need it for the import tool

### Step 3: Get Your Spreadsheet ID

1. **Open Your Google Sheet**
2. **Copy the URL**
   - Format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - The long string after `/d/` and before `/edit` is your Spreadsheet ID

3. **Example:**
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```
   Spreadsheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Step 4: Share Your Sheet (Optional)

If you want to access the sheet from any domain:
1. Click "Share" in your Google Sheet
2. Click "Change to anyone with the link"
3. Set to "Viewer"
4. Click "Done"

## 🚀 **Using the Data Import Tool**

### Access the Tool
1. Go to: `https://your-app.vercel.app/admin/data-import`
2. Choose your import method

### For CSV Import:
1. Select "CSV File"
2. Choose your data type (Guests, Bookings, Units, Payments)
3. Upload your CSV file or paste content
4. Preview the data
5. Click "Import"

### For Google Sheets Import:
1. Select "Google Sheets"
2. Enter your API Key
3. Enter your Spreadsheet ID
4. Click "Connect to Sheets"
5. Select the sheet you want to import
6. Click "Load Sheet Data"
7. Preview and import

## 📊 **Data Format Requirements**

### Guests Table
**Required Fields:**
- `First Name` or `firstName` or `first_name`
- `Last Name` or `lastName` or `last_name`
- `Phone` or `phone` or `Phone Number`

**Optional Fields:**
- `Email` or `email`
- `ID Number` or `idNumber` or `id_number`
- `ID Type` or `idType` or `id_type`
- `Address` or `address`
- `Nationality` or `nationality`
- `Emergency Contact` or `emergencyContact` or `emergency_contact_name`
- `Emergency Phone` or `emergencyPhone` or `emergency_contact_phone`
- `Notes` or `notes`

### Bookings Table
**Required Fields:**
- `Guest ID` or `guestId` or `guest_id`
- `Unit ID` or `unitId` or `unit_id`
- `Check In Date` or `checkIn` or `check_in_date`
- `Check Out Date` or `checkOut` or `check_out_date`
- `Total Amount` or `totalAmount` or `total_amount`

**Optional Fields:**
- `Booking Number` or `bookingNumber` or `booking_number` (auto-generated if missing)
- `Number of Guests` or `guests` or `number_of_guests`
- `Deposit Amount` or `deposit` or `deposit_amount`
- `Status` or `status`
- `Special Requests` or `specialRequests` or `special_requests`

### Units Table
**Required Fields:**
- `Unit Number` or `unitNumber` or `unit_number`

**Optional Fields:**
- `Unit Type ID` or `unitTypeId` or `unit_type_id`
- `Status` or `status`
- `Last Maintenance` or `lastMaintenance` or `last_maintenance`
- `Notes` or `notes`

### Payments Table
**Required Fields:**
- `Booking ID` or `bookingId` or `booking_id`
- `Amount` or `amount`
- `Payment Method` or `paymentMethod` or `payment_method`

**Optional Fields:**
- `Payment Type` or `paymentType` or `payment_type`
- `Reference Number` or `reference` or `reference_number`
- `Receipt Number` or `receiptNumber` or `receipt_number` (auto-generated if missing)
- `Status` or `status`
- `Notes` or `notes`

## 🔄 **Data Transformation**

The import tool automatically handles:

### Date Formats
- Converts various date formats to ISO format (YYYY-MM-DD)
- Handles: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.

### Status Mapping
**Booking Status:**
- `pending` → `pending`
- `confirmed` → `confirmed`
- `checked in` → `checked_in`
- `checked out` → `checked_out`
- `cancelled` → `cancelled`
- `no show` → `no_show`

**Unit Status:**
- `available` → `available`
- `occupied` → `occupied`
- `maintenance` → `maintenance`
- `cleaning` → `cleaning`
- `out of order` → `out_of_order`

**Payment Method:**
- `cash` → `cash`
- `gcash` → `gcash`
- `bank transfer` → `bank_transfer`
- `credit card` → `credit_card`
- `debit card` → `debit_card`

## 🛡️ **Security Best Practices**

### API Key Security
1. **Restrict API Key** to your domain only
2. **Use Environment Variables** in production
3. **Rotate Keys** periodically
4. **Monitor Usage** in Google Cloud Console

### Data Privacy
1. **Backup Your Data** before importing
2. **Test with Sample Data** first
3. **Validate Import Results** after completion
4. **Keep Original Sheets** as backup

## 🔧 **Troubleshooting**

### Common Issues

**"API Key Invalid"**
- Check if API key is correct
- Ensure Google Sheets API is enabled
- Verify API key restrictions

**"Spreadsheet Not Found"**
- Check spreadsheet ID is correct
- Ensure sheet is shared (if needed)
- Verify sheet exists and is accessible

**"No Data Found"**
- Check if sheet has data
- Ensure first row contains headers
- Verify sheet name is correct

**"Import Errors"**
- Check data format matches requirements
- Verify required fields are present
- Look for duplicate entries

### Error Messages

**"Could not find the table"**
- Run the database schema first
- Check table names match exactly

**"Foreign key constraint"**
- Import parent tables first (e.g., guests before bookings)
- Check if referenced IDs exist

**"Duplicate key value"**
- Data already exists in database
- Use unique identifiers or clear existing data

## 📈 **Performance Tips**

### Large Datasets
1. **Import in Batches** (100-500 records at a time)
2. **Use CSV** for very large datasets
3. **Monitor Progress** during import
4. **Check Database Performance** after import

### Optimization
1. **Index Tables** after import
2. **Clean Data** before importing
3. **Validate Relationships** between tables
4. **Backup Database** before large imports

## 🎯 **Next Steps**

After successful import:

1. **Verify Data** in the application
2. **Test Functionality** with imported data
3. **Update Database Schema** if needed
4. **Set Up Relationships** between tables
5. **Configure Business Logic** for your specific needs

## 📞 **Support**

If you encounter issues:

1. **Check the Troubleshooting section** above
2. **Review your data format** against requirements
3. **Test with sample data** first
4. **Contact support** with specific error messages

---

**Ready to import your data?** Visit `/admin/data-import` to get started! 