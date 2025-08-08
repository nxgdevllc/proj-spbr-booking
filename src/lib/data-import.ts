import { supabase } from './supabase'

// Types for data import
export interface ImportResult {
  success: boolean
  message: string
  importedCount: number
  errors: string[]
}

interface DataRow {
  [key: string]: string | number | boolean | null
}

// Simple CSV parser
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

// Simple data transformer
export class DataTransformer {
  static transformEmployeeData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      employee_name: String(row['Employee Name'] || ''),
      employee_role: String(row['Employee Role'] || ''),
      employment_type: String(row['Employment Type'] || 'Full-Time'),
      status: String(row['Status'] || 'Active'),
      monthly_pay: parseFloat(String(row['Monthly Pay'] || '0').replace(/[₱$,]/g, '')),
      weekly_pay: parseFloat(String(row['Weekly Pay'] || '0').replace(/[₱$,]/g, '')),
      daily_pay: parseFloat(String(row['Daily Pay'] || '0').replace(/[₱$,]/g, '')),
      notes: String(row['Notes'] || '')
    }))
  }

  static transformUnitTypeData(rawData: DataRow[]): DataRow[] {
    return rawData.map(row => ({
      unit_id: String(row['Unit ID'] || ''),
      rental_type: String(row['Rental Type'] || ''),
      maximum_capacity: parseInt(String(row['Maximum Capacity'] || '1')),
      day_rate: parseFloat(String(row['Day Rate'] || '0').replace(/[₱$,]/g, '')),
      ci_day_time: String(row['CI Day Time'] || '7:00 AM'),
      co_day_time: String(row['CO Day Time'] || '5:00 PM'),
      night_rate: parseFloat(String(row['Night Rate'] || '0').replace(/[₱$,]/g, '')),
      ci_night_time: String(row['CI Night Time'] || '6:00 PM'),
      co_night_time: String(row['CO Night Time'] || '6:00 AM'),
      hourly_rate: parseFloat(String(row['24-Hr Rate'] || '0').replace(/[₱$,]/g, '')),
      ci_24hr_time: String(row['CI 24-HR Time'] || '7:00 AM'),
      co_24hr_time: String(row['CO 24-HR Time'] || '6:00 AM'),
      early_ci_late_co_fee: parseFloat(String(row['Early CI and Late CO fee'] || '0').replace(/[₱$,]/g, '')),
      early_ci_time_day: String(row['Early CI Time Day If unit not used prior night'] || '3:00 AM'),
      early_ci_time_night: String(row['Early CI Time Night If unit not used during day'] || '4:00 PM'),
      early_ci_time_24hr: String(row['Early CI Time 24HR If unit not used prior booking'] || '3:00 AM'),
      late_co_time_day: String(row['Late CO Time Day If Available'] || '7:00 PM'),
      late_co_time_night: String(row['Late CO Time Night If Available'] || '9:00 AM'),
      late_co_time_24hr: String(row['Late CO Time 24-HR If Available'] || '9:00 AM'),
      early_ci_late_co_fee_percentage: parseFloat(String(row['Early CI and Late CO fee percentage'] || '0')),
      notes: String(row['Notes'] || '')
    }))
  }
}

// Import functions
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
          result.errors.push(`Employee ${employee.employee_name}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Employee ${employee.employee_name}: ${error}`)
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
          result.errors.push(`Unit Type ${unitType.unit_id}: ${error.message}`)
        } else {
          result.importedCount++
        }
      } catch (error) {
        result.errors.push(`Unit Type ${unitType.unit_id}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    result.message = `Imported ${result.importedCount} unit types successfully`
    
  } catch (error) {
    result.message = `Import failed: ${error}`
  }

  return result
}

// Import functions for actual schema
export async function importRentalUnitsPricing(data: DataRow[]): Promise<ImportResult> {
  try {
    const transformedData = data.map(row => ({
      unit_id: String(row['unit_id'] || ''),
      rental_type: String(row['rental_type'] || ''),
      maximum_capacity: row['maximum_capacity'] ? parseFloat(String(row['maximum_capacity'])) : null,
      day_rate: String(row['day_rate'] || ''),
      ci_day_time: String(row['ci_day_time'] || ''),
      co_day_time: String(row['co_day_time'] || ''),
      night_rate: String(row['night_rate'] || ''),
      ci_night_time: String(row['ci_night_time'] || ''),
      co_night_time: String(row['co_night_time'] || ''),
      '24hr_rate': String(row['24hr_rate'] || ''),
      ci_24hr_time: String(row['ci_24hr_time'] || ''),
      co_24hr_time: String(row['co_24hr_time'] || ''),
      early_ci_and_late_co_fee: String(row['early_ci_and_late_co_fee'] || ''),
      early_ci_time_day_if_unit_not_used_prior_night: String(row['early_ci_time_day_if_unit_not_used_prior_night'] || ''),
      early_ci_time_night_if_unit_not_used_during_day: String(row['early_ci_time_night_if_unit_not_used_during_day'] || ''),
      early_ci_time_24hr_if_unit_not_used_prior_booking: String(row['early_ci_time_24hr_if_unit_not_used_prior_booking'] || ''),
      late_co_time_day_if_available: String(row['late_co_time_day_if_available'] || ''),
      late_co_time_night_if_available: String(row['late_co_time_night_if_available'] || ''),
      late_co_time_24hr_if_available: String(row['late_co_time_24hr_if_available'] || ''),
      early_ci_and_late_co_fee_percentage: String(row['early_ci_and_late_co_fee_percentage'] || ''),
      notes: String(row['notes'] || '')
    }))

    const { error } = await supabase
      .from('rental_units_pricing')
      .upsert(transformedData, { onConflict: 'unit_id' })

    if (error) throw error

    return {
      success: true,
      message: `Successfully imported ${transformedData.length} rental units`,
      importedCount: transformedData.length,
      errors: []
    }
  } catch (error) {
    console.error('Error importing rental units:', error)
    return {
      success: false,
      message: 'Failed to import rental units',
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

export async function importInventoryItems(data: DataRow[]): Promise<ImportResult> {
  try {
    const transformedData = data.map(row => ({
      sid: String(row['sid'] || ''),
      category: String(row['category'] || ''),
      product_name: String(row['product_name'] || ''),
      stock: row['stock'] ? parseFloat(String(row['stock'])) : 0,
      size: String(row['size'] || ''),
      units: String(row['units'] || ''),
      price: row['price'] ? parseFloat(String(row['price'])) : 0,
      min_level: row['min_level'] ? parseFloat(String(row['min_level'])) : 0,
      supplier: String(row['supplier'] || ''),
      barcode: String(row['barcode'] || '')
    }))

    const { error } = await supabase
      .from('inventory_items')
      .upsert(transformedData, { onConflict: 'sid' })

    if (error) throw error

    return {
      success: true,
      message: `Successfully imported ${transformedData.length} inventory items`,
      importedCount: transformedData.length,
      errors: []
    }
  } catch (error) {
    console.error('Error importing inventory items:', error)
    return {
      success: false,
      message: 'Failed to import inventory items',
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

export async function importExpenses2025(data: DataRow[]): Promise<ImportResult> {
  try {
    const transformedData = data.map(row => ({
      receipt_number: row['receipt_number'] ? parseFloat(String(row['receipt_number'])) : null,
      date: String(row['date'] || ''),
      amount: String(row['amount'] || ''),
      payment_method: String(row['payment_method'] || ''),
      vendor: String(row['vendor'] || ''),
      category: String(row['category'] || ''),
      project: String(row['project'] || ''),
      notes: String(row['notes'] || ''),
      status: String(row['status'] || ''),
      closed_by: String(row['closed_by'] || '')
    }))

    const { error } = await supabase
      .from('expenses_2025')
      .insert(transformedData)

    if (error) throw error

    return {
      success: true,
      message: `Successfully imported ${transformedData.length} expenses`,
      importedCount: transformedData.length,
      errors: []
    }
  } catch (error) {
    console.error('Error importing expenses:', error)
    return {
      success: false,
      message: 'Failed to import expenses',
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

export async function importEmployeeSalaries2025(data: DataRow[]): Promise<ImportResult> {
  try {
    const transformedData = data.map(row => ({
      date: String(row['date'] || ''),
      amount: row['amount'] ? parseFloat(String(row['amount'])) : 0,
      name: String(row['name'] || ''),
      notes: String(row['notes'] || ''),
      payment_type: String(row['payment_type'] || '')
    }))

    const { error } = await supabase
      .from('employee_salaries_2025')
      .insert(transformedData)

    if (error) throw error

    return {
      success: true,
      message: `Successfully imported ${transformedData.length} salary records`,
      importedCount: transformedData.length,
      errors: []
    }
  } catch (error) {
    console.error('Error importing salaries:', error)
    return {
      success: false,
      message: 'Failed to import salaries',
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

export async function importStakeholderWithdrawals2025(data: DataRow[]): Promise<ImportResult> {
  try {
    const transformedData = data.map(row => ({
      date: String(row['date'] || ''),
      amount: row['amount'] ? parseFloat(String(row['amount'])) : 0,
      stakeholder: String(row['stakeholder'] || ''),
      notes: String(row['notes'] || '')
    }))

    const { error } = await supabase
      .from('stakeholder_withdrawals_2025')
      .insert(transformedData)

    if (error) throw error

    return {
      success: true,
      message: `Successfully imported ${transformedData.length} withdrawal records`,
      importedCount: transformedData.length,
      errors: []
    }
  } catch (error) {
    console.error('Error importing withdrawals:', error)
    return {
      success: false,
      message: 'Failed to import withdrawals',
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

export async function importEmployeeAdvances(data: DataRow[]): Promise<ImportResult> {
  try {
    const transformedData = data.map(row => ({
      employee: String(row['employee'] || ''),
      product_or_cash_advance: String(row['product_or_cash_advance'] || ''),
      amount: row['amount'] ? parseFloat(String(row['amount'])) : 0,
      notes: String(row['notes'] || ''),
      totals: row['totals'] ? parseFloat(String(row['totals'])) : 0
    }))

    const { error } = await supabase
      .from('employee_advances')
      .insert(transformedData)

    if (error) throw error

    return {
      success: true,
      message: `Successfully imported ${transformedData.length} advance records`,
      importedCount: transformedData.length,
      errors: []
    }
  } catch (error) {
    console.error('Error importing advances:', error)
    return {
      success: false,
      message: 'Failed to import advances',
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

export async function importMoneyDenominations(data: DataRow[]): Promise<ImportResult> {
  try {
    const transformedData = data.map(row => ({
      denomination: String(row['denomination'] || ''),
      quantity: row['quantity'] ? parseFloat(String(row['quantity'])) : 0,
      total_value: row['total_value'] ? parseFloat(String(row['total_value'])) : 0
    }))

    const { error } = await supabase
      .from('money_denominations')
      .upsert(transformedData, { onConflict: 'denomination' })

    if (error) throw error

    return {
      success: true,
      message: `Successfully imported ${transformedData.length} denomination records`,
      importedCount: transformedData.length,
      errors: []
    }
  } catch (error) {
    console.error('Error importing denominations:', error)
    return {
      success: false,
      message: 'Failed to import denominations',
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

 