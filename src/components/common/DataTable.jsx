import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { AppDataTable } from '../app'

/**
 * Compatibility adapter for legacy TanStack column definitions.
 * Rendering, search, states, and pagination belong to AppDataTable.
 */
export function DataTable({
 columns = [],
 data = [],
 isLoading = false,
 searchPlaceholder = 'Cari data...',
 onSearchChange,
 searchValue = '',
 filterComponent = null,
}) {
 const appColumns = useMemo(
 () => columns.map((column, index) => {
 const key = column.accessorKey || column.id || `column-${index}`

 return {
 key,
 label: typeof column.header === 'function' ? column.id || key : column.header,
 sortable: Boolean(column.accessorKey && column.enableSorting !== false),
 render: (row) => {
 const value = column.accessorKey
 ? row[column.accessorKey]
 : typeof column.accessorFn === 'function'
 ? column.accessorFn(row)
 : row[column.id]
 const info = {
 getValue: () => value,
 row: { original: row },
 }

 return typeof column.cell === 'function' ? column.cell(info) : column.cell ?? value ?? '—'
 },
 }
 }),
 [columns]
 )

 const searchableKeys = columns.map((column) => column.accessorKey).filter(Boolean)

 return (
 <AppDataTable
 columns={appColumns}
 data={data}
 isLoading={isLoading}
 searchPlaceholder={searchPlaceholder}
 search={searchValue}
 onSearchChange={onSearchChange}
 searchableKeys={searchableKeys}
 filters={filterComponent}
 clientPagination
 />
 )
}

export default DataTable

DataTable.propTypes = {
 columns: PropTypes.array,
 data: PropTypes.array,
 isLoading: PropTypes.bool,
 searchPlaceholder: PropTypes.string,
 onSearchChange: PropTypes.func,
 searchValue: PropTypes.string,
 filterComponent: PropTypes.node,
}
