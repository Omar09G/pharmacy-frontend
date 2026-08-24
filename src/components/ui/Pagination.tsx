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

  // The backend may return an inflated total when using the `limit+1`
  // pattern (fetching one extra row to detect if more pages exist).
  // Clamp totalPages so phantom pages are never shown.
  const rawPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const maxReachable = page + (totalItems > page * pageSize ? 1 : 0);
  const totalPages = Math.min(rawPages, Math.max(1, maxReachable));

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
        <span className="text-xs tabular-nums text-muted">
          {totalItems === 0
            ? t('common.noData')
            : `${t('common.showing')} ${from}–${to} ${t('common.of')} ${totalItems} ${t('common.results')}`}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="page-size-select"
              className="text-xs text-muted font-black"
            >
              {t('common.rowsPerPage')}
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-7 cursor-pointer rounded-md border border-line bg-surface px-1.5 text-xs tabular-nums text-ink transition-colors hover:border-brand focus:border-brand"
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
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* -10 pages */}
        <button
          type="button"
          disabled={page <= 10}
          onClick={() => goTo(page - 10)}
          title={`-10`}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1 text-xs font-medium text-muted transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          -10
        </button>

        {/* Previous */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          title={t('common.previous')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page select */}
        <div className="flex items-center gap-1.5 px-1">
          <select
            value={page}
            onChange={(e) => goTo(Number(e.target.value))}
            aria-label={t('common.goToPage')}
            className="h-8 min-w-14 cursor-pointer rounded-md border border-line bg-surface px-2 text-center text-xs font-semibold tabular-nums text-ink transition-colors hover:border-brand focus:border-brand"
          >
            {pageOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">/ {totalPages}</span>
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          title={t('common.next')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>

        {/* +10 pages */}
        <button
          type="button"
          disabled={page + 10 > totalPages}
          onClick={() => goTo(page + 10)}
          title={`+10`}
          className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1 text-xs font-medium text-muted transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          +10
        </button>

        {/* Last page */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goTo(totalPages)}
          title={t('common.last')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
