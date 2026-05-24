import React from "react";

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  selectedId?: string;
  rowIdAccessor?: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  selectedId,
  rowIdAccessor,
  emptyMessage = "No plugins or data available.",
  className = ""
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto w-full relative ${className}`}>
      <table className="min-w-full divide-y divide-gray-100 text-left border-collapse">
        <thead className="sticky top-0 bg-[#F9FAFB] border-b border-[#E5E7EB] z-10">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-4 py-3.5 text-xs font-semibold tracking-tight text-[#6B7280] ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => {
              const itemId = rowIdAccessor ? rowIdAccessor(item) : String(rowIdx);
              const isSelected = selectedId === itemId;
              
              return (
                <tr
                  key={itemId}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-all duration-150 text-sm text-gray-700 ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${isSelected ? "bg-[#F0F7F7] ring-1 ring-inset ring-[#0F5B59] ring-opacity-10 font-semibold text-gray-900" : "hover:bg-[#F9FAFB]"}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3 max-w-[240px] truncate ${col.className || ""}`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
