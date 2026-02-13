import * as React from "react"
import { cn } from "../../lib/utils"

interface Column<T> {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: ({ row }: { row: T }) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  selectedRows?: string[];
  onSelectedRowsChange?: (rows: string[]) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  selectedRows = [],
  onSelectedRowsChange,
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    const allIds = data.map(item => item.id);
    onSelectedRowsChange?.(checked ? allIds : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectedRowsChange?.([...selectedRows, id]);
    } else {
      onSelectedRowsChange?.(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b">
            <th className="h-12 px-4 text-left align-middle font-medium text-gray-900">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
            </th>
            {columns.map((column) => (
              <th key={column.id} className="h-12 px-4 text-left align-middle font-medium text-gray-900">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="h-24 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id} className="border-b transition-colors hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.id} className="p-4 align-middle">
                    {column.cell ? column.cell({ row }) : (row[column.accessorKey] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {pagination && (
          <tfoot>
            <tr>
              <td colSpan={columns.length + 1} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPageChange?.(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => onPageChange?.(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
