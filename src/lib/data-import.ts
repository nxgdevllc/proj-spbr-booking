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

// Google Sheets API integration
export class GoogleSheetsImporter {
  private apiKey: string
  private spreadsheetId: string

  constructor(apiKey: string, spreadsheetId: string) {
    this.apiKey = apiKey
    this.spreadsheetId = spreadsheetId
  }

  async getSheetData(sheetName: string): Promise<any[]> {
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
        const obj: any = {}
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
      
      return data.sheets.map((sheet: any) => sheet.properties.title)
    } catch (error) {
      console.error('Error fetching sheet names:', error)
      throw error
    }
  }
}

// CSV Import functionality
export class CSVImporter {
  static parseCSV(csvContent: string): any[] {
    const lines = csvContent.split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least headers and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).filter(line => line.trim())

    return rows.map(row => {
      const values = row.split(',').map(v => v.trim().replace(/"/g, ''))
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || null
      })
      return obj
    })
  }
}

// Data transformation and validation
export class DataTransformer {
  static transformGuestData(rawData: any[]): any[] {
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

  static transformBookingData(rawData: any[]): any[] {
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

  static transformUnitData(rawData: any[]): any[] {
    return rawData.map(row => ({
      unit_number: row['Unit Number'] || row['unitNumber'] || row['unit_number'] || '',
      unit_type_id: row['Unit Type ID'] || row['unitTypeId'] || row['unit_type_id'] || null,
      status: mapUnitStatus(row['Status'] || row['status'] || 'available'),
      last_maintenance: parseDate(row['Last Maintenance'] || row['lastMaintenance'] || row['last_maintenance']),
      notes: row['Notes'] || row['notes'] || null
    }))
  }

  static transformPaymentData(rawData: any[]): any[] {
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

  static transformEmployeeData(rawData: any[]): any[] {
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
}

// Data import functions
export async function importGuests(data: any[]): Promise<ImportResult> {
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

export async function importBookings(data: any[]): Promise<ImportResult> {
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

export async function importUnits(data: any[]): Promise<ImportResult> {
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

export async function importPayments(data: any[]): Promise<ImportResult> {
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

export async function importEmployees(data: any[]): Promise<ImportResult> {
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