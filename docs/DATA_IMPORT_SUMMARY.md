# Data Import Summary - Google Sheets to Supabase

## 🎯 **Your Options for Data Migration**

You have **3 excellent options** to get your Google Sheets data into the San Pedro Beach Resort management system:

### **Option 1: CSV Export (Easiest & Recommended)**
- **Time**: 10-15 minutes
- **Difficulty**: Easy
- **Best for**: Quick migration, one-time import

**Steps:**
1. Export each Google Sheet as CSV
2. Use the Data Import Tool at `/admin/data-import`
3. Upload and import your data

### **Option 2: Google Sheets API (Most Flexible)**
- **Time**: 30-45 minutes setup
- **Difficulty**: Medium
- **Best for**: Ongoing sync, large datasets

**Steps:**
1. Set up Google Cloud Console
2. Enable Google Sheets API
3. Get API credentials
4. Use the Data Import Tool with API integration

### **Option 3: Hybrid Approach (Best of Both)**
- **Time**: 20-30 minutes
- **Difficulty**: Easy
- **Best for**: Most users

**Steps:**
1. Export critical data as CSV for immediate import
2. Set up API for future updates
3. Use both methods as needed

## 🚀 **Quick Start: CSV Export Method**

### Step 1: Export Your Google Sheets
1. **Open your Google Sheets**
2. **For each sheet:**
   - Go to **File** → **Download** → **CSV**
   - Save with descriptive names like `guests.csv`, `bookings.csv`

### Step 2: Prepare Your Data
1. **Download CSV templates** from `/admin/data-import/templates`
2. **Compare your data** with the templates
3. **Adjust column headers** to match the templates
4. **Clean your data** (remove empty rows, fix formats)

### Step 3: Import Your Data
1. **Go to**: `https://your-app.vercel.app/admin/data-import`
2. **Select**: "CSV File"
3. **Choose data type**: Guests, Bookings, Units, or Payments
4. **Upload your CSV** or paste content
5. **Preview data** to ensure it looks correct
6. **Click Import**

## 🔧 **Advanced: Google Sheets API Method**

### Step 1: Google Cloud Console Setup
1. **Visit**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. **Create Project**: "San Pedro Beach Resort Data Import"
3. **Enable API**: Google Sheets API
4. **Create Credentials**: API Key
5. **Restrict Key**: To your domain only

### Step 2: Get Your Credentials
1. **API Key**: Copy from Google Cloud Console
2. **Spreadsheet ID**: From your Google Sheets URL
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### Step 3: Use API Integration
1. **Go to**: `/admin/data-import`
2. **Select**: "Google Sheets"
3. **Enter**: API Key and Spreadsheet ID
4. **Connect**: Test the connection
5. **Select Sheet**: Choose which sheet to import
6. **Import**: Preview and import your data

## 📊 **Data Format Requirements**

### **Guests Data**
**Required Columns:**
- `First Name` (or `firstName`, `first_name`)
- `Last Name` (or `lastName`, `last_name`)
- `Phone` (or `phone`, `Phone Number`)

**Optional Columns:**
- `Email`, `ID Number`, `Address`, `Nationality`
- `Emergency Contact`, `Emergency Phone`, `Notes`

### **Bookings Data**
**Required Columns:**
- `Guest ID` (or `guestId`, `guest_id`)
- `Unit ID` (or `unitId`, `unit_id`)
- `Check In Date` (or `checkIn`, `check_in_date`)
- `Check Out Date` (or `checkOut`, `check_out_date`)
- `Total Amount` (or `totalAmount`, `total_amount`)

**Optional Columns:**
- `Booking Number`, `Number of Guests`, `Deposit Amount`
- `Status`, `Special Requests`

### **Units Data**
**Required Columns:**
- `Unit Number` (or `unitNumber`, `unit_number`)

**Optional Columns:**
- `Unit Type ID`, `Status`, `Last Maintenance`, `Notes`

### **Payments Data**
**Required Columns:**
- `Booking ID` (or `bookingId`, `booking_id`)
- `Amount` (or `amount`)
- `Payment Method` (or `paymentMethod`, `payment_method`)

**Optional Columns:**
- `Payment Type`, `Reference Number`, `Receipt Number`
- `Status`, `Notes`

## 🔄 **Automatic Data Transformation**

The import tool automatically handles:

### **Date Formats**
- Converts: `01/15/2024`, `15/01/2024`, `2024-01-15` → `2024-01-15`
- Handles various international date formats

### **Status Mapping**
- **Booking Status**: `pending`, `confirmed`, `checked in`, `checked out`, `cancelled`, `no show`
- **Unit Status**: `available`, `occupied`, `maintenance`, `cleaning`, `out of order`
- **Payment Method**: `cash`, `gcash`, `bank transfer`, `credit card`, `debit card`

### **Auto-Generation**
- **Booking Numbers**: `BK2024001`, `BK2024002`, etc.
- **Receipt Numbers**: `RCV2024001`, `RCV2024002`, etc.

## 📋 **Import Order (Important!)**

Import your data in this order to avoid foreign key errors:

1. **Unit Types** (if you have them)
2. **Units**
3. **Guests**
4. **Bookings**
5. **Payments**

## 🛠️ **Tools Available**

### **Data Import Tool**
- **Location**: `/admin/data-import`
- **Features**: CSV upload, Google Sheets API, data preview, error handling

### **CSV Templates**
- **Location**: `/admin/data-import/templates`
- **Features**: Download sample templates, copy to clipboard

### **Setup Guides**
- **Google Sheets API**: `docs/GOOGLE_SHEETS_SETUP.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.sql`

## 🔍 **Data Validation & Error Handling**

### **Before Import**
- ✅ Check column headers match requirements
- ✅ Ensure required fields are filled
- ✅ Validate date formats
- ✅ Check for duplicate entries

### **During Import**
- ✅ Preview data before importing
- ✅ Review any error messages
- ✅ Check import results
- ✅ Verify data in the application

### **After Import**
- ✅ Test functionality with imported data
- ✅ Verify relationships between tables
- ✅ Check data integrity
- ✅ Update any missing information

## 🚨 **Common Issues & Solutions**

### **"Could not find the table"**
**Solution**: Run the database schema first
```sql
-- In Supabase SQL Editor, run:
-- docs/DATABASE_SCHEMA.sql
```

### **"Foreign key constraint"**
**Solution**: Import tables in the correct order
1. Parent tables first (guests, units)
2. Child tables second (bookings, payments)

### **"Duplicate key value"**
**Solution**: 
- Clear existing data, or
- Use unique identifiers, or
- Update existing records instead of inserting

### **"Invalid date format"**
**Solution**: Use YYYY-MM-DD format
- ✅ `2024-01-15`
- ❌ `01/15/2024` (will be converted automatically)

## 📈 **Performance Tips**

### **Large Datasets**
- Import in batches (100-500 records)
- Use CSV for very large datasets
- Monitor progress during import

### **Optimization**
- Clean data before importing
- Remove empty rows and columns
- Validate relationships between tables

## 🎯 **Recommended Workflow**

### **For Most Users (Recommended)**
1. **Export Google Sheets as CSV**
2. **Download templates** from `/admin/data-import/templates`
3. **Format your data** to match templates
4. **Import using CSV method**
5. **Verify data** in the application
6. **Set up API** for future updates (optional)

### **For Advanced Users**
1. **Set up Google Sheets API**
2. **Test with sample data**
3. **Import using API method**
4. **Set up automated sync** (future feature)

## 📞 **Getting Help**

### **If You Need Assistance**
1. **Check the troubleshooting section** in `docs/GOOGLE_SHEETS_SETUP.md`
2. **Review your data format** against the templates
3. **Test with sample data** first
4. **Contact support** with specific error messages

### **Useful Resources**
- **Templates**: `/admin/data-import/templates`
- **Import Tool**: `/admin/data-import`
- **Setup Guide**: `docs/GOOGLE_SHEETS_SETUP.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.sql`

---

## 🚀 **Ready to Start?**

**Quick Start (5 minutes):**
1. Go to `/admin/data-import/templates`
2. Download the templates you need
3. Format your Google Sheets data
4. Export as CSV
5. Import using the Data Import Tool

**Need help?** Check the detailed guides in the `docs/` folder! 