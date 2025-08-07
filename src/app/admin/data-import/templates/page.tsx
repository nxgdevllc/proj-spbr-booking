'use client'

import { useState } from 'react'

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const templates = {
    guests: {
      filename: 'guests-template.csv',
      content: `First Name,Last Name,Email,Phone,ID Number,ID Type,Address,Nationality,Emergency Contact,Emergency Phone,Notes
John,Doe,john.doe@email.com,+639123456789,123456789,Passport,123 Main St Manila,Philippines,Jane Doe,+639987654321,Regular guest
Maria,Santos,maria.santos@email.com,+639234567890,987654321,Driver's License,456 Beach Rd Cebu,Philippines,Pedro Santos,+639876543210,Prefers ocean view
`,
      description: 'Template for importing guest information including contact details, identification, and emergency contacts.'
    },
    bookings: {
      filename: 'bookings-template.csv',
      content: `Booking Number,Guest ID,Unit ID,Check In Date,Check Out Date,Number of Guests,Total Amount,Deposit Amount,Status,Special Requests
BK2024001,guest-001,unit-001,2024-01-15,2024-01-17,2,5000.00,1000.00,confirmed,Early check-in requested
BK2024002,guest-002,unit-002,2024-01-20,2024-01-22,4,8000.00,2000.00,pending,Extra towels needed
BK2024003,guest-003,unit-003,2024-01-25,2024-01-27,1,3000.00,500.00,checked_in,Quiet room preferred
`,
      description: 'Template for importing booking information including dates, amounts, and special requests.'
    },
    units: {
      filename: 'units-template.csv',
      content: `Unit Number,Unit Type ID,Status,Last Maintenance,Notes
Cottage-001,type-001,available,2024-01-10,Beachfront cottage with ocean view
Cottage-002,type-001,occupied,2024-01-08,Recently renovated
Room-101,type-002,maintenance,2024-01-12,AC needs repair
Room-102,type-002,available,2024-01-15,Standard room
Villa-001,type-003,cleaning,2024-01-14,Luxury villa with private pool
`,
      description: 'Template for importing unit information including status and maintenance records.'
    },
    payments: {
      filename: 'payments-template.csv',
      content: `Booking ID,Amount,Payment Method,Payment Type,Reference Number,Receipt Number,Status,Notes
booking-001,5000.00,gcash,full_payment,GCASH123456789,RCV2024001,completed,Full payment via GCash
booking-002,2000.00,cash,deposit,CASH001,RCV2024002,completed,Deposit received
booking-003,3000.00,bank_transfer,partial_payment,BT2024001,RCV2024003,completed,Partial payment via bank transfer
booking-004,1000.00,gcash,refund,GCASH987654321,RCV2024004,completed,Refund for early checkout
`,
      description: 'Template for importing payment information including methods, amounts, and reference numbers.'
    },
    unit_types: {
      filename: 'unit-types-template.csv',
      content: `Name,Description,Base Price,Max Capacity,Amenities,Images
Beachfront Cottage,Spacious cottage with direct beach access,5000.00,4,"WiFi,AC,Kitchen,Beach View","cottage1.jpg,cottage2.jpg"
Standard Room,Comfortable room with basic amenities,3000.00,2,"WiFi,AC,TV","room1.jpg,room2.jpg"
Luxury Villa,Premium villa with private pool,12000.00,6,"WiFi,AC,Kitchen,Pool,Beach View","villa1.jpg,villa2.jpg"
Family Suite,Large suite perfect for families,8000.00,8,"WiFi,AC,Kitchen,Multiple Rooms","suite1.jpg,suite2.jpg"
`,
      description: 'Template for importing unit type information including pricing and amenities.'
    }
  }

  const downloadTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates]
    if (!template) return

    const blob = new Blob([template.content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = template.filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const copyTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates]
    if (!template) return

    navigator.clipboard.writeText(template.content).then(() => {
      alert('Template copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy template. Please download it instead.')
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            CSV Templates
          </h1>
          
          <p className="text-gray-600 mb-8">
            Download these templates to help you format your Google Sheets data correctly for import.
            Each template includes sample data and the correct column headers.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(templates).map(([key, template]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
                  {key.replace('_', ' ')} Template
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => downloadTemplate(key)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download Template
                  </button>
                  
                  <button
                    onClick={() => copyTemplate(key)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Copy to Clipboard
                  </button>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                  <strong>Filename:</strong> {template.filename}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">How to Use Templates</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>1. Download Template:</strong> Click "Download Template" to get the CSV file</p>
              <p><strong>2. Open in Excel/Sheets:</strong> Open the CSV file in Excel or Google Sheets</p>
              <p><strong>3. Replace Sample Data:</strong> Replace the sample data with your actual data</p>
              <p><strong>4. Keep Headers:</strong> Don't change the column headers (first row)</p>
              <p><strong>5. Save as CSV:</strong> Save your file as CSV format</p>
              <p><strong>6. Import:</strong> Use the Data Import Tool to upload your CSV</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Important Notes</h3>
            <div className="space-y-2 text-sm text-yellow-700">
              <p><strong>Date Format:</strong> Use YYYY-MM-DD format (e.g., 2024-01-15)</p>
              <p><strong>Currency:</strong> Use numbers only, no currency symbols (e.g., 5000.00)</p>
              <p><strong>Phone Numbers:</strong> Include country code (e.g., +639123456789)</p>
              <p><strong>Required Fields:</strong> Make sure all required fields are filled</p>
              <p><strong>Special Characters:</strong> Avoid special characters in column headers</p>
              <p><strong>Empty Values:</strong> Leave empty cells blank, don't use "N/A" or "None"</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href="/admin/data-import"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Data Import Tool
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 