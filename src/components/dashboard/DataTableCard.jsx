import React from 'react'
import { AppDataTable } from '../app'

export default function DataTableCard({
 title,
 subtitle,
 action,
 headers = [],
 rows = [],
 loading = false,
 emptyMessage = 'Belum ada data pada tabel ini.',
 error = null,
 onRetry,
 className = ''
}) {
 const tableData = rows.map((row, index) => {
 const cells = Array.isArray(row) ? row : [row]
 const searchText = cells
 .filter((cell) => typeof cell === 'string' || typeof cell === 'number')
 .join(' ')

 return { __rowKey: index, cells, searchText }
 })

 const columns = headers.map((header, index) => ({
 key: `cell-${index}`,
 label: header,
 render: (row) => row.cells[index] ?? '—',
 }))

 return (
 <AppDataTable
 title={title}
 description={subtitle}
 columns={columns}
 data={tableData}
 keyField="__rowKey"
 searchableKeys={['searchText']}
 isLoading={loading}
 isError={Boolean(error)}
 errorMessage={error}
 onRetry={onRetry}
 emptyTitle="Data Tidak Ditemukan"
 emptyDescription={emptyMessage}
 actions={action}
 className={className}
 />
 )
}
