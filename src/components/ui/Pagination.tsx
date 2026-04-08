import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between py-3 text-sm text-neutral-600 dark:text-neutral-400">
      <span>
        {t('common.showing')} {from}-{to} {t('common.of')} {totalItems}{' '}
        {t('common.results')}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
          {t('common.previous')}
        </Button>
        <span className="px-2 font-medium text-neutral-900 dark:text-neutral-100">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          {t('common.next')}
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
