'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

interface DataTable {
  name: string
  label: string
  columns: string[]
  editable: boolean
  deletable: boolean
  addable: boolean
}

interface TableRow {
  id?: string
  employee_id?: string
  product_code?: string
  booking_number?: string
  [key: string]: unknown
}

const DATA_TABLES: DataTable[] = [
  {
    name: 'employees',
    label: 'Employees',
    columns: ['employee_name', 'employee_role', 'employment_type', 'status', 'monthly_pay', 'weekly_pay', 'daily_pay', 'notes'],
    editable: true,
    deletable: true,
    addable: true
  },
  {
    name: 'rental_units_pricing',
    label: 'Rental Units & Pricing',
    columns: ['unit_id', 'rental_type', 'maximum_capacity', 'day_rate', 'night_rate', '24hr_rate', 'early_ci_and_late_co_fee', 'notes'],
    editable: true,
    deletable: true,
    addable: true
  },
  {
    name: 'inventory_items',
    label: 'Inventory Items',
    columns: ['id', 'category', 'product_name', 'stock', 'size', 'units', 'price', 'min_level', 'supplier', 'barcode', 'barcode_type', 'restock_price', 'value', 'photo1', 'photo2', 'photo3', 'notes', 'tags'],
    editable: true,
    deletable: true,
    addable: true
  },
  {
    name: 'expenses_2025',
    label: 'Expenses 2025',
    columns: ['receipt_number', 'date', 'amount', 'payment_method', 'vendor', 'category', 'project', 'notes', 'status', 'closed_by'],
    editable: true,
    deletable: true,
    addable: true
  },
  {
    name: 'employee_salaries_2025',
    label: 'Employee Salaries 2025',
    columns: ['date', 'amount', 'name', 'notes', 'payment_type'],
    editable: true,
    deletable: true,
    addable: true
  },
  {
    name: 'stakeholder_withdrawals_2025',
    label: 'Stakeholder Withdrawals 2025',
    columns: ['date', 'amount', 'stakeholder', 'notes'],
    editable: true,
    deletable: true,
    addable: true
  },
  {
    name: 'employee_advances',
    label: 'Employee Advances',
    columns: ['employee', 'product_or_cash_advance', 'amount', 'notes', 'totals'],
    editable: true,
    deletable: true,
    addable: true
  },
  {
    name: 'money_denominations',
    label: 'Money Denominations',
    columns: ['denomination', 'quantity', 'total_value'],
    editable: true,
    deletable: true,
    addable: true
  }
]

export default function DataManagerPage() {
  const [selectedTable, setSelectedTable] = useState<DataTable>(DATA_TABLES[0])
  const [data, setData] = useState<TableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<TableRow>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterColumn, setFilterColumn] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRowData, setNewRowData] = useState<TableRow>({})
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: result, error } = await supabase
        .from(selectedTable.name)
        .select('*')
        .limit(1000)

      if (error) throw error
      setData(result || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data')
    } finally {
      setLoading(false)
    }
  }, [selectedTable.name])

  // Load data when table changes
  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter and sort data
  const filteredAndSortedData = data
    .filter(row => {
      if (searchTerm) {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      if (filterColumn && filterValue) {
        return String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
      }
      return true
    })
    .sort((a, b) => {
      if (!sortColumn) return 0
      const aVal = String(a[sortColumn] || '')
      const bVal = String(b[sortColumn] || '')
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal)
      } else {
        return bVal.localeCompare(aVal)
      }
    })

  // Handle inline editing
  const startEditing = (row: TableRow) => {
    // Use the id column as the primary key for editing
    setEditingRow(String(row.id || ''))
    setEditingData({ ...row })
  }

  const saveEdit = async () => {
    if (!editingRow) return

    try {
      const firstColumn = selectedTable.columns[0]
      const { error } = await supabase
        .from(selectedTable.name)
        .update(editingData)
        .eq(firstColumn, editingRow)

      if (error) throw error

      setData(data.map(row => 
        (row.id || row.employee_id || row.product_code || row.booking_number) === editingRow 
          ? { ...row, ...editingData }
          : row
      ))
      setEditingRow(null)
      setEditingData({})
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving changes')
    }
  }

  const cancelEdit = () => {
    setEditingRow(null)
    setEditingData({})
  }

  // Handle row deletion
  const deleteRow = async (row: TableRow) => {
    if (!confirm('Are you sure you want to delete this row?')) return

    try {
      const firstColumn = selectedTable.columns[0]
      const { error } = await supabase
        .from(selectedTable.name)
        .delete()
        .eq(firstColumn, row[firstColumn])

      if (error) throw error

      setData(data.filter(r => r[firstColumn] !== row[firstColumn]))
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error deleting row')
    }
  }

  // Handle adding new row
  const addNewRow = async () => {
    try {
      const { data: result, error } = await supabase
        .from(selectedTable.name)
        .insert(newRowData)
        .select()

      if (error) throw error

      setData([...(result || []), ...data])
      setShowAddForm(false)
      setNewRowData({})
    } catch (error) {
      console.error('Error adding row:', error)
      alert('Error adding new row')
    }
  }

  // Handle bulk operations
  const deleteSelectedRows = async () => {
    if (selectedRows.size === 0) return
    if (!confirm('Are you sure you want to delete ' + selectedRows.size + ' rows?')) return

    try {
      const firstColumn = selectedTable.columns[0]
      const { error } = await supabase
        .from(selectedTable.name)
        .delete()
        .in(firstColumn, Array.from(selectedRows))

      if (error) throw error

      setData(data.filter(row => !selectedRows.has(String(row[firstColumn] || ''))))
      setSelectedRows(new Set())
    } catch (error) {
      console.error('Error bulk deleting:', error)
      alert('Error deleting selected rows')
    }
  }

  const toggleRowSelection = (rowId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId)
    } else {
      newSelected.add(rowId)
    }
    setSelectedRows(newSelected)
  }

  const selectAllRows = () => {
    const firstColumn = selectedTable.columns[0]
    if (selectedRows.size === filteredAndSortedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredAndSortedData.map(row => String(row[firstColumn] || '')).filter(id => id !== '')))
    }
  }

  return (
    <ProtectedRoute requiredRole="manager">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Data Manager</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = '/admin/data-import'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Import Data
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Table Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Select Table</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {DATA_TABLES.map((table) => (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedTable.name === table.name
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {table.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search all columns..."
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Column</label>
              <select
                value={filterColumn}
                onChange={(e) => setFilterColumn(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Columns</option>
                {selectedTable.columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Value</label>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Enter filter value..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterColumn('')
                  setFilterValue('')
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-800">
                  {selectedRows.size} row(s) selected
                </span>
                <button
                  onClick={deleteSelectedRows}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Add New Row Button */}
          {selectedTable.addable && (
            <div className="mb-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New {selectedTable.label.slice(0, -1)}
              </button>
            </div>
          )}

          {/* Add New Row Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Add New {selectedTable.label.slice(0, -1)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedTable.columns.map(column => (
                  <div key={column}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      value={String(newRowData[column] || '')}
                      onChange={(e) => setNewRowData({ ...newRowData, [column]: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={addNewRow}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewRowData({})
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading data...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                        onChange={selectAllRows}
                        className="rounded border-gray-300"
                      />
                    </th>
                    {selectedTable.columns.map(column => (
                      <th
                        key={column}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          if (sortColumn === column) {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                          } else {
                            setSortColumn(column)
                            setSortDirection('asc')
                          }
                        }}
                      >
                        <div className="flex items-center">
                          {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          {sortColumn === column && (
                            sortDirection === 'asc' ? 
                              <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                              <ArrowDownIcon className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedData.map((row, index) => {
                    const firstColumn = selectedTable.columns[0]
                    const rowId = String(row[firstColumn] || '')
                    const isEditing = editingRow === rowId
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row.id || '')}
                            onChange={() => toggleRowSelection(row.id || '')}
                            className="rounded border-gray-300"
                          />
                        </td>
                        {selectedTable.columns.map(column => (
                          <td key={column} className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                type="text"
                                value={String(editingData[column] || '')}
                                onChange={(e) => setEditingData({ ...editingData, [column]: e.target.value })}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            ) : (
                              <span className="truncate max-w-xs block">
                                {String(row[column] || '')}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                          {isEditing ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={saveEdit}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-1">
                              {selectedTable.editable && (
                                <button
                                  onClick={() => startEditing(row)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              )}
                              {selectedTable.deletable && (
                                <button
                                  onClick={() => deleteRow(row)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedData.length} of {data.length} total rows
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}