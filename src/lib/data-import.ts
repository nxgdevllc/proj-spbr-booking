import { supabase } from './supabase'
import { Database } from './supabase'

// Types for data import
export interface ImportResult {
  success: boolean
  message: string
  importedCount: number
  errors: string[]
}

export interface SheetMapping {
  sheetName: string
  tableName: keyof Database['public']['Tables']
  columnMapping: Record<string, string>
  requiredFields: string[]
  optionalFields: string[]
}

interface DataRow {
  [key: string]: string | number | boolean | null
}

// Google Sheets API integration
export class GoogleSheetsImporter {
  private apiKey: string
  private spreadsheetId: string

  constructor(apiKey: string, spreadsheetId: string) {
    this.apiKey = apiKey
    this.spreadsheetId = spreadsheetId
  }

  async getSheetData(sheetName: string): Promise<DataRow[]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}?key=${this.apiKey}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (!data.values || data.values.length < 2) {
        throw new Error('No data found in sheet')
      }

      const headers = data.values[0]
      const rows = data.values.slice(1)
      
      return rows.map(row => {
        const obj: DataRow = {}
        headers.forEach((header: string, index: number) => {
          obj[header.trim()] = row[index] || null
        })
        return obj
      })
    } catch (error) {
      console.error('Error fetching sheet data:', error)
      throw error
    }
  }

  async getAllSheets(): Promise<string[]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?key=${this.apiKey}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      return data.sheets.map((sheet: { properties: { title: string } }) => sheet.properties.title)
    } catch (error) {
      console.error('Error fetching sheet names:', error)
      throw error
    }
  }
}

// CSV Import functionality
export class CSVImporter {
  static parseCSV(csvContent: string): DataRow[] {
    const lines = csvContent.split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least headers and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).filter(line => line.trim())

    return rows.map(row => {
      const values = row.split(',').map(v => v.trim().replace(/"/g, ''))
      const obj: DataRow = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || null
      })
      return obj
    })
  }
}

// Data transformation and validation
export class DataTransformer {
  static transformGuestData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      first_name: row['First Name'] || row['firstName'] || row['first_name'] || '',
      last_name: row['Last Name'] || row['lastName'] || row['last_name'] || '',
      email: row['Email'] || row['email'] || null,
      phone: row['Phone'] || row['phone'] || row['Phone Number'] || '',
      id_number: row['ID Number'] || row['idNumber'] || row['id_number'] || null,
      id_type: row['ID Type'] || row['idType'] || row['id_type'] || null,
      address: row['Address'] || row['address'] || null,
      nationality: row['Nationality'] || row['nationality'] || null,
      emergency_contact_name: row['Emergency Contact'] || row['emergencyContact'] || row['emergency_contact_name'] || null,
      emergency_contact_phone: row['Emergency Phone'] || row['emergencyPhone'] || row['emergency_contact_phone'] || null,
      notes: row['Notes'] || row['notes'] || null
    }))
  }

  static transformBookingData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      booking_number: row['Booking Number'] || row['bookingNumber'] || row['booking_number'] || generateBookingNumber(),
      guest_id: row['Guest ID'] || row['guestId'] || row['guest_id'] || null,
      unit_id: row['Unit ID'] || row['unitId'] || row['unit_id'] || null,
      check_in_date: parseDate(row['Check In'] || row['checkIn'] || row['check_in_date']),
      check_out_date: parseDate(row['Check Out'] || row['checkOut'] || row['check_out_date']),
      number_of_guests: parseInt(row['Guests'] || row['guests'] || row['number_of_guests'] || '1'),
      total_amount: parseFloat(row['Total Amount'] || row['totalAmount'] || row['total_amount'] || '0'),
      deposit_amount: parseFloat(row['Deposit'] || row['deposit'] || row['deposit_amount'] || '0'),
      status: mapBookingStatus(row['Status'] || row['status'] || 'pending'),
      special_requests: row['Special Requests'] || row['specialRequests'] || row['special_requests'] || null
    }))
  }

  static transformUnitData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      unit_number: row['Unit Number'] || row['unitNumber'] || row['unit_number'] || '',
      unit_type_id: row['Unit Type ID'] || row['unitTypeId'] || row['unit_type_id'] || null,
      status: mapUnitStatus(row['Status'] || row['status'] || 'available'),
      last_maintenance: parseDate(row['Last Maintenance'] || row['lastMaintenance'] || row['last_maintenance']),
      notes: row['Notes'] || row['notes'] || null
    }))
  }

  static transformPaymentData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      booking_id: row['Booking ID'] || row['bookingId'] || row['booking_id'] || null,
      amount: parseFloat(row['Amount'] || row['amount'] || '0'),
      payment_method: mapPaymentMethod(row['Payment Method'] || row['paymentMethod'] || row['payment_method'] || 'cash'),
      payment_type: mapPaymentType(row['Payment Type'] || row['paymentType'] || row['payment_type'] || 'full_payment'),
      reference_number: row['Reference'] || row['reference'] || row['reference_number'] || null,
      receipt_number: row['Receipt Number'] || row['receiptNumber'] || row['receipt_number'] || generateReceiptNumber(),
      status: mapPaymentStatus(row['Status'] || row['status'] || 'completed'),
      notes: row['Notes'] || row['notes'] || null
    }))
  }

  static transformEmployeeData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      employee_id: row['Employee ID'] || row['employeeId'] || row['employee_id'] || generateEmployeeId(),
      position: row['Position'] || row['position'] || row['Job Title'] || row['jobTitle'] || row['Employee Role'] || '',
      hire_date: parseDate(row['Hire Date'] || row['hireDate'] || row['hire_date'] || row['Start Date'] || row['startDate']),
      base_salary: parseSalary(row['Base Salary'] || row['baseSalary'] || row['base_salary'] || row['Salary'] || row['salary'] || row['Monthly Pay'] || '0'),
      is_active: mapBoolean(row['Is Active'] || row['isActive'] || row['is_active'] || row['Active'] || row['active'] || row['Status'] || 'true'),
      emergency_contact: row['Emergency Contact'] || row['emergencyContact'] || row['emergency_contact'] || row['Emergency Contact Name'] || null,
      emergency_phone: row['Emergency Phone'] || row['emergencyPhone'] || row['emergency_phone'] || row['Emergency Contact Phone'] || null
    }))
  }

  static transformUnitTypeData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      type_name: row['Unit ID'] || row['Rental Type'] || row['Type Name'] || row['typeName'] || '',
      description: row['Notes'] || row['notes'] || row['Description'] || row['description'] || null,
      max_capacity: parseInt(row['Maximum Capacity'] || row['maxCapacity'] || row['max_capacity'] || '1'),
      day_rate: parseSalary(row['Day Rate'] || row['dayRate'] || row['day_rate'] || '0'),
      night_rate: parseSalary(row['Night Rate'] || row['nightRate'] || row['night_rate'] || '0'),
      hourly_rate: parseSalary(row['24-Hr Rate'] || row['hourlyRate'] || row['hourly_rate'] || '0'),
      check_in_time_day: row['CI Day Time'] || row['checkInTimeDay'] || row['check_in_time_day'] || '7:00 AM',
      check_out_time_day: row['CO Day Time'] || row['checkOutTimeDay'] || row['check_out_time_day'] || '5:00 PM',
      check_in_time_night: row['CI Night Time'] || row['checkInTimeNight'] || row['check_in_time_night'] || '6:00 PM',
      check_out_time_night: row['CO Night Time'] || row['checkOutTimeNight'] || row['check_out_time_night'] || '6:00 AM',
      early_check_in_fee: parseSalary(row['Early CI and Late CO fee'] || row['earlyCheckInFee'] || row['early_check_in_fee'] || '0'),
      early_check_in_fee_percentage: parseFloat(row['Early CI and Late CO fee percentage'] || row['earlyCheckInFeePercentage'] || row['early_check_in_fee_percentage'] || '0')
    }))
  }

  static transformProductData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      product_code: row['SID'] || row['Product Code'] || row['productCode'] || row['product_code'] || generateProductCode(),
      product_name: row['Product Name'] || row['productName'] || row['product_name'] || '',
      category_id: null, // Will be created/linked based on Category
      description: row['Notes'] || row['notes'] || row['Description'] || row['description'] || null,
      unit_price: parseSalary(row['Price'] || row['price'] || row['unitPrice'] || row['unit_price'] || '0'),
      cost_price: parseSalary(row['re-stock Price'] || row['restockPrice'] || row['cost_price'] || '0'),
      current_stock: parseInt(row['Stock'] || row['stock'] || row['currentStock'] || row['current_stock'] || '0'),
      min_stock_level: parseInt(row['Min Level'] || row['minLevel'] || row['min_stock_level'] || '0'),
      reorder_quantity: parseInt(row['re-stock Quantity'] || row['reorderQuantity'] || row['reorder_quantity'] || '0'),
      supplier_id: null, // Will be created/linked based on Supplier
      barcode: row['Barcode/QR2-Data'] || row['barcode'] || row['Barcode'] || null,
      barcode_type: row['Barcode/QR2-Type'] || row['barcodeType'] || row['barcode_type'] || null,
      size: row['Size'] || row['size'] || null,
      unit: row['Units'] || row['unit'] || row['Units'] || null,
      is_active: true
    }))
  }

  static transformExpenseData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      receipt_number: row['Receipt Number'] || row['receiptNumber'] || row['receipt_number'] || generateReceiptNumber(),
      expense_date: parseDate(row['Date'] || row['date'] || row['expenseDate'] || row['expense_date']),
      amount: parseSalary(row['Amount'] || row['amount'] || '0'),
      payment_method: mapPaymentMethod(row['Payment Method'] || row['paymentMethod'] || row['payment_method'] || 'cash'),
      vendor: row['Vendor'] || row['vendor'] || row['Supplier'] || row['supplier'] || '',
      category_id: null, // Will be created/linked based on Category
      project: row['Project'] || row['project'] || null,
      notes: row['Notes'] || row['notes'] || null,
      status: mapExpenseStatus(row['Status'] || row['status'] || 'closed'),
      closed_by: row['Closed By'] || row['closedBy'] || row['closed_by'] || null
    }))
  }

  static transformSalaryData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      payment_date: parseDate(row['Date'] || row['date'] || row['paymentDate'] || row['payment_date']),
      amount: parseSalary(row['Amount'] || row['amount'] || '0'),
      employee_id: null, // Will be linked based on Name
      payment_type: mapSalaryPaymentType(row['Payment Type'] || row['paymentType'] || row['payment_type'] || 'salary'),
      notes: row['Notes'] || row['notes'] || null
    }))
  }

  static transformWithdrawalData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      withdrawal_date: parseDate(row['date'] || row['Date'] || row['withdrawalDate'] || row['withdrawal_date']),
      amount: parseSalary(row['amount'] || row['Amount'] || '0'),
      stakeholder_name: row['stakeholder'] || row['Stakeholder'] || row['stakeholderName'] || row['stakeholder_name'] || '',
      notes: row['notes'] || row['Notes'] || null
    }))
  }

  static transformCashAdvanceData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      employee_id: null, // Will be linked based on employee name
      advance_type: row['product or cash advance'] || row['advanceType'] || row['advance_type'] || 'cash',
      amount: parseSalary(row['amount'] || row['Amount'] || '0'),
      notes: row['notes'] || row['Notes'] || null,
      total_amount: parseSalary(row['totals'] || row['totalAmount'] || row['total_amount'] || '0')
    }))
  }
}

// Data import functions
export async function importGuests(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformGuestData(data)
    
    for (const guest of transformedData) {
      try {
        const { error } = await supabase
          .from('guests')
          .insert(guest)
        
        if (error) {
          result.errors.push(`Guest ${guest.first_name} ${guest.last_name}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Guest ${guest.first_name} ${guest.last_name}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} guests successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importBookings(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformBookingData(data)
    
    for (const booking of transformedData) {
      try {
        const { error } = await supabase
          .from('bookings')
          .insert(booking)
        
        if (error) {
          result.errors.push(`Booking ${booking.booking_number}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Booking ${booking.booking_number}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} bookings successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importUnits(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformUnitData(data)
    
    for (const unit of transformedData) {
      try {
        const { error } = await supabase
          .from('units')
          .insert(unit)
        
        if (error) {
          result.errors.push(`Unit ${unit.unit_number}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Unit ${unit.unit_number}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} units successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importPayments(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformPaymentData(data)
    
    for (const payment of transformedData) {
      try {
        const { error } = await supabase
          .from('payments')
          .insert(payment)
        
        if (error) {
          result.errors.push(`Payment ${payment.receipt_number}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Payment ${payment.receipt_number}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} payments successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importEmployees(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformEmployeeData(data)
    
    for (const employee of transformedData) {
      try {
        const { error } = await supabase
          .from('employees')
          .insert(employee)
        
        if (error) {
          result.errors.push(`Employee ${employee.employee_id}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Employee ${employee.employee_id}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} employees successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importUnitTypes(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformUnitTypeData(data)
    
    for (const unitType of transformedData) {
      try {
        const { error } = await supabase
          .from('unit_types')
          .insert(unitType)
        
        if (error) {
          result.errors.push(`Unit Type ${unitType.type_name}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Unit Type ${unitType.type_name}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} unit types successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importProducts(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformProductData(data)
    
    for (const product of transformedData) {
      try {
        const { error } = await supabase
          .from('products')
          .insert(product)
        
        if (error) {
          result.errors.push(`Product ${product.product_name}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Product ${product.product_name}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} products successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importExpenses(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformExpenseData(data)
    
    for (const expense of transformedData) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert({
            ...expense,
            transaction_type: 'expense',
            transaction_date: expense.expense_date
          })
        
        if (error) {
          result.errors.push(`Expense ${expense.receipt_number}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Expense ${expense.receipt_number}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} expenses successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importSalaries(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformSalaryData(data)
    
    for (const salary of transformedData) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert({
            ...salary,
            transaction_type: 'salary',
            transaction_date: salary.payment_date
          })
        
        if (error) {
          result.errors.push(`Salary payment: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Salary payment: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} salary payments successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importWithdrawals(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformWithdrawalData(data)
    
    for (const withdrawal of transformedData) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert({
            ...withdrawal,
            transaction_type: 'withdrawal',
            transaction_date: withdrawal.withdrawal_date
          })
        
        if (error) {
          result.errors.push(`Withdrawal: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Withdrawal: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} withdrawals successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

export async function importCashAdvances(data: DataRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    importedCount: 0,
    errors: []
  }

  try {
    const transformedData = DataTransformer.transformCashAdvanceData(data)
    
    for (const advance of transformedData) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert({
            ...advance,
            transaction_type: 'cash_advance',
            transaction_date: new Date().toISOString().split('T')[0]
          })
        
        if (error) {
          result.errors.push(`Cash advance: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Cash advance: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} cash advances successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

// Utility functions
function parseDate(dateString: string | null): string | null {
  if (!dateString) return null
  
  // Handle various date formats
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  
  return date.toISOString().split('T')[0]
}

function mapBookingStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'confirmed': 'confirmed',
    'checked in': 'checked_in',
    'checked out': 'checked_out',
    'cancelled': 'cancelled',
    'no show': 'no_show'
  }
  return statusMap[status.toLowerCase()] || 'pending'
}

function mapUnitStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'available': 'available',
    'occupied': 'occupied',
    'maintenance': 'maintenance',
    'cleaning': 'cleaning',
    'out of order': 'out_of_order'
  }
  return statusMap[status.toLowerCase()] || 'available'
}

function mapPaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    'cash': 'cash',
    'gcash': 'gcash',
    'bank transfer': 'bank_transfer',
    'credit card': 'credit_card',
    'debit card': 'debit_card'
  }
  return methodMap[method.toLowerCase()] || 'cash'
}

function mapPaymentType(type: string): string {
  const typeMap: Record<string, string> = {
    'deposit': 'deposit',
    'full payment': 'full_payment',
    'partial payment': 'partial_payment',
    'refund': 'refund'
  }
  return typeMap[type.toLowerCase()] || 'full_payment'
}

function mapPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'completed': 'completed',
    'failed': 'failed',
    'refunded': 'refunded'
  }
  return statusMap[status.toLowerCase()] || 'completed'
}

function generateBookingNumber(): string {
  return `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

function generateReceiptNumber(): string {
  return `RCP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

function generateEmployeeId(): string {
  return `EMP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

function mapBoolean(value: string): boolean {
  if (!value) return true
  const lowerValue = value.toLowerCase()
  return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1' || lowerValue === 'active'
}

function parseSalary(salaryString: string | null): number {
  if (!salaryString) return 0
  
  // Remove currency symbols, commas, and spaces
  const cleaned = salaryString.replace(/[₱$,]/g, '').replace(/\s/g, '')
  
  // Parse as float
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

function generateProductCode(): string {
  return `PROD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

function mapExpenseStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'closed': 'closed',
    'open': 'open',
    'pending': 'pending',
    'approved': 'approved',
    'rejected': 'rejected'
  }
  return statusMap[status.toLowerCase()] || 'closed'
}

function mapSalaryPaymentType(type: string): string {
  const typeMap: Record<string, string> = {
    'salary': 'salary',
    'bonus': 'bonus',
    'overtime': 'overtime',
    'advance': 'advance'
  }
  return typeMap[type.toLowerCase()] || 'salary'
} 