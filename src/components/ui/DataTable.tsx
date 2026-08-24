'use no memo';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import { cn } from '../../utils/cn';

interface DataTableProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  caption?: string;
}

function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage,
  caption,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table v8 manages its own caching; compiler correctly skips this file ('use no memo')
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-3 py-4" role="status" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-line">
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const ariaSortMap = {
                  asc: 'ascending',
                  desc: 'descending',
                } as const;
                const ariaSort = sorted ? ariaSortMap[sorted] : undefined;
                const content = header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    );
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      'px-4 py-3 text-left font-medium text-muted',
                      'hover:bg-raised/60 transition-colors',
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 rounded outline-offset-4 hover:text-ink"
                        title={t('a11y.sortableColumn')}
                      >
                        {content}
                        {(() => {
                          if (sorted === 'asc')
                            return (
                              <ArrowUp
                                size={14}
                                className="text-brand"
                                aria-hidden="true"
                              />
                            );
                          if (sorted === 'desc')
                            return (
                              <ArrowDown
                                size={14}
                                className="text-brand"
                                aria-hidden="true"
                              />
                            );
                          return <ArrowUpDown size={14} aria-hidden="true" />;
                        })()}
                      </button>
                    ) : (
                      content
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-line/60 hover:bg-raised/60 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-ink">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
