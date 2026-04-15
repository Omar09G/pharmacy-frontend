import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PAGE_SIZE_OPTIONS } from '../../utils/constants';

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const goTo = (p: number) => {
    const clamped = Math.max(1, Math.min(p, totalPages));
    if (clamped !== page) onPageChange(clamped);
  };

  const handlePageSizeChange = (newSize: number) => {
    onPageSizeChange?.(newSize);
    onPageChange(1);
  };

  const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Info + page size */}
      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
          {totalItems === 0
            ? t('common.noData')
            : `${t('common.showing')} ${from}–${to} ${t('common.of')} ${totalItems} ${t('common.results')}`}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="page-size-select"
              className="text-xs text-neutral-500 dark:text-neutral-400 font-bold"
            >
              {t('common.rowsPerPage')}
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-7 cursor-pointer rounded-md border border-neutral-300 bg-white px-1.5 text-xs tabular-nums text-neutral-800 transition-colors hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goTo(1)}
          title={t('common.first')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* -10 pages */}
        <button
          type="button"
          disabled={page <= 10}
          onClick={() => goTo(page - 10)}
          title={`-10`}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          -10
        </button>

        {/* Previous */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          title={t('common.previous')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page select */}
        <div className="flex items-center gap-1.5 px-1">
          <select
            value={page}
            onChange={(e) => goTo(Number(e.target.value))}
            aria-label={t('common.goToPage')}
            className="h-8 min-w-[3.5rem] cursor-pointer rounded-md border border-neutral-300 bg-white px-2 text-center text-xs font-semibold tabular-nums text-neutral-800 transition-colors hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-blue-500"
          >
            {pageOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            / {totalPages}
          </span>
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          title={t('common.next')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ChevronRight size={16} />
        </button>

        {/* +10 pages */}
        <button
          type="button"
          disabled={page + 10 > totalPages}
          onClick={() => goTo(page + 10)}
          title={`+10`}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          +10
        </button>

        {/* Last page */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goTo(totalPages)}
          title={t('common.last')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
