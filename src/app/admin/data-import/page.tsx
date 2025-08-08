'use client'

import { useState, useRef } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  CSVImporter, 
  importEmployees,
  importRentalUnitsPricing,
  importInventoryItems,
  importExpenses2025,
  importEmployeeSalaries2025,
  importStakeholderWithdrawals2025,
  importEmployeeAdvances,
  importMoneyDenominations,
  ImportResult 
} from '@/lib/data-import'

// Define DataRow type locally since it's not exported from data-import
interface DataRow {
  [key: string]: string | number | boolean | null
}

export default function DataImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState('')
  const [dataType, setDataType] = useState<'employees' | 'rental_units_pricing' | 'inventory_items' | 'expenses_2025' | 'employee_salaries_2025' | 'stakeholder_withdrawals_2025' | 'employee_advances' | 'money_denominations'>('employees')
  const [previewData, setPreviewData] = useState<DataRow[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle CSV file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCsvContent(content)
        parseAndPreviewData(content)
      }
      reader.readAsText(file)
    }
  }

  // Handle CSV content input
  const handleCsvContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value
    setCsvContent(content)
    if (content.trim()) {
      parseAndPreviewData(content)
    } else {
      setPreviewData([])
    }
  }

  // Parse and preview data
  const parseAndPreviewData = (content: string) => {
    try {
      const data = CSVImporter.parseCSV(content)
      setPreviewData(data.slice(0, 5)) // Show first 5 rows
    } catch (error) {
      console.error('Error parsing CSV:', error)
      setPreviewData([])
    }
  }



  // Import data to database
  const handleImport = async () => {
    if (previewData.length === 0) {
      alert('No data to import')
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const data = CSVImporter.parseCSV(csvContent)

      let result: ImportResult

      switch (dataType) {
        case 'employees':
          result = await importEmployees(data)
          break
        case 'rental_units_pricing':
          result = await importRentalUnitsPricing(data)
          break
        case 'inventory_items':
          result = await importInventoryItems(data)
          break
        case 'expenses_2025':
          result = await importExpenses2025(data)
          break
        case 'employee_salaries_2025':
          result = await importEmployeeSalaries2025(data)
          break
        case 'stakeholder_withdrawals_2025':
          result = await importStakeholderWithdrawals2025(data)
          break
        case 'employee_advances':
          result = await importEmployeeAdvances(data)
          break
        case 'money_denominations':
          result = await importMoneyDenominations(data)
          break
        default:
          throw new Error('Invalid data type')
      }

      setImportResult(result)

      // Delete file after successful import
      if (result.success && selectedFile) {
        try {
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          setSelectedFile(null)
          setCsvContent('')
          setPreviewData([])
        } catch (error) {
          console.warn('Could not clear file input:', error)
        }
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: `Import failed: ${error}`,
        importedCount: 0,
        errors: [error as string]
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Data Import Tool
          </h1>



          {/* Data Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { key: 'employees', label: 'Employees' },
                { key: 'rental_units_pricing', label: 'Rental Units & Pricing' },
                { key: 'inventory_items', label: 'Inventory Items' },
                { key: 'expenses_2025', label: 'Expenses 2025' },
                { key: 'employee_salaries_2025', label: 'Employee Salaries 2025' },
                { key: 'stakeholder_withdrawals_2025', label: 'Stakeholder Withdrawals 2025' },
                { key: 'employee_advances', label: 'Employee Advances' },
                { key: 'money_denominations', label: 'Money Denominations' }
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setDataType(type.key as typeof dataType)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dataType === type.key
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* CSV Import Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">CSV Import</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Paste CSV Content
                </label>
                <textarea
                  value={csvContent}
                  onChange={handleCsvContentChange}
                  placeholder="Paste your CSV content here..."
                  rows={8}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>



          {/* Data Preview */}
          {previewData.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Preview (First 5 rows)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0] || {}).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {String(value || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Button */}
          {previewData.length > 0 && (
            <div className="mb-8">
              <button
                onClick={handleImport}
                disabled={isImporting}
                className={`px-6 py-3 rounded-lg font-medium text-white ${
                  isImporting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isImporting ? 'Importing...' : `Import ${dataType}`}
              </button>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className={`p-4 rounded-lg ${
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                Import {importResult.success ? 'Successful' : 'Failed'}
              </h3>
              <p className={`mt-2 ${
                importResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {importResult.message}
              </p>
              
              {importResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-800">Errors:</h4>
                  <ul className="mt-2 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Import Guidelines</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Guests:</strong> First Name, Last Name, Email, Phone, ID Number, Address, etc.</p>
              <p><strong>Bookings:</strong> Guest ID, Unit ID, Check In Date, Check Out Date, Total Amount, etc.</p>
              <p><strong>Units:</strong> Unit Number, Unit Type ID, Status, Last Maintenance, etc.</p>
              <p><strong>Payments:</strong> Booking ID, Amount, Payment Method, Reference Number, etc.</p>
              <p><strong>Employees:</strong> Employee Name, Employee Role, Status, Monthly Pay, Employment Type, etc.</p>
              <p><strong>Unit Types:</strong> Unit ID, Rental Type, Maximum Capacity, Day Rate, Night Rate, etc.</p>
                              <p><strong>Products:</strong> ID, Product Name, Category, Stock, Price, Restock Price, Value, Barcode, Barcode Type, Notes, Tags, etc.</p>
              <p><strong>Expenses:</strong> Receipt Number, Date, Amount, Payment Method, Vendor, Category, etc.</p>
              <p><strong>Salaries:</strong> Date, Amount, Name, Payment Type, Notes, etc.</p>
              <p><strong>Withdrawals:</strong> Date, Amount, Stakeholder, Notes, etc.</p>
              <p><strong>Cash Advances:</strong> Employee, Product/Cash Advance, Amount, Notes, etc.</p>
              <p><strong>CSV:</strong> Use comma-separated values with headers in the first row.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}