'use client'

import { useState, useRef } from 'react'
import { 
  GoogleSheetsImporter, 
  CSVImporter, 
  importGuests, 
  importBookings, 
  importUnits, 
  importPayments,
  importEmployees,
  ImportResult 
} from '@/lib/data-import'

export default function DataImportPage() {
  const [importType, setImportType] = useState<'csv' | 'sheets'>('csv')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState('')
  const [dataType, setDataType] = useState<'guests' | 'bookings' | 'units' | 'payments' | 'employees'>('guests')
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  
  // Google Sheets settings
  const [sheetsApiKey, setSheetsApiKey] = useState('')
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [sheetName, setSheetName] = useState('')
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  
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

  // Connect to Google Sheets
  const connectToSheets = async () => {
    if (!sheetsApiKey || !spreadsheetId) {
      alert('Please enter both API Key and Spreadsheet ID')
      return
    }

    try {
      const importer = new GoogleSheetsImporter(sheetsApiKey, spreadsheetId)
      const sheets = await importer.getAllSheets()
      setAvailableSheets(sheets)
      if (sheets.length > 0) {
        setSheetName(sheets[0])
      }
    } catch (error) {
      alert(`Error connecting to Google Sheets: ${error}`)
    }
  }

  // Load data from Google Sheets
  const loadSheetsData = async () => {
    if (!sheetsApiKey || !spreadsheetId || !sheetName) {
      alert('Please configure Google Sheets settings')
      return
    }

    try {
      const importer = new GoogleSheetsImporter(sheetsApiKey, spreadsheetId)
      const data = await importer.getSheetData(sheetName)
      setPreviewData(data.slice(0, 5)) // Show first 5 rows
    } catch (error) {
      alert(`Error loading sheet data: ${error}`)
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
      let data: any[] = []

      if (importType === 'csv') {
        data = CSVImporter.parseCSV(csvContent)
      } else {
        const importer = new GoogleSheetsImporter(sheetsApiKey, spreadsheetId)
        data = await importer.getSheetData(sheetName)
      }

      let result: ImportResult

      switch (dataType) {
        case 'guests':
          result = await importGuests(data)
          break
        case 'bookings':
          result = await importBookings(data)
          break
        case 'units':
          result = await importUnits(data)
          break
        case 'payments':
          result = await importPayments(data)
          break
        case 'employees':
          result = await importEmployees(data)
          break
        default:
          throw new Error('Invalid data type')
      }

      setImportResult(result)
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Data Import Tool
          </h1>

          {/* Import Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Import Source</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setImportType('csv')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  importType === 'csv'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                CSV File
              </button>
              <button
                onClick={() => setImportType('sheets')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  importType === 'sheets'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Google Sheets
              </button>
            </div>
          </div>

          {/* Data Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'guests', label: 'Guests' },
                { key: 'bookings', label: 'Bookings' },
                { key: 'units', label: 'Units' },
                { key: 'payments', label: 'Payments' },
                { key: 'employees', label: 'Employees' }
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setDataType(type.key as any)}
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
          {importType === 'csv' && (
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
          )}

          {/* Google Sheets Import Section */}
          {importType === 'sheets' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Google Sheets Import</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Sheets API Key
                  </label>
                  <input
                    type="password"
                    value={sheetsApiKey}
                    onChange={(e) => setSheetsApiKey(e.target.value)}
                    placeholder="Enter your Google Sheets API key"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="Enter spreadsheet ID from URL"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={connectToSheets}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Connect to Sheets
                  </button>
                  
                  {availableSheets.length > 0 && (
                    <select
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availableSheets.map((sheet) => (
                        <option key={sheet} value={sheet}>
                          {sheet}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {availableSheets.length > 0 && (
                  <button
                    onClick={loadSheetsData}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Load Sheet Data
                  </button>
                )}
              </div>
            </div>
          )}

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
              <p><strong>Google Sheets:</strong> Make sure your sheet has headers in the first row.</p>
              <p><strong>CSV:</strong> Use comma-separated values with headers in the first row.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 