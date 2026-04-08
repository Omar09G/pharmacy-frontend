import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from '@tanstack/react-table';
import { inventoryApi } from '../../services/inventoryApi';
import type { InventoryStock } from '../../models/inventory.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { formatLocal } from '../../utils/dateUtils';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';

const InventoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, search],
    queryFn: () =>
      inventoryApi.getStock(page, DEFAULT_PAGE_SIZE, 0, search || undefined),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const columns: ColumnDef<InventoryStock>[] = [
    { accessorKey: 'productName', header: t('inventory.productName') },
    { accessorKey: 'barcode', header: t('inventory.barcode') },
    { accessorKey: 'qtyOnHand', header: t('inventory.qtyOnHand') },
    {
      accessorKey: 'maxExpiryDate',
      header: t('inventory.maxExpiryDate'),
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? v.slice(0, 10) : '—';
      },
    },
    {
      accessorKey: 'lastMovementAt',
      header: t('inventory.lastMovementAt'),
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? formatLocal(v, i18n.language) : '—';
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('inventory.title')}
        </h1>
      </div>
      <Card>
        <SearchInput
          onSearch={(v) => {
            setSearch(v);
            setPage(0);
          }}
          placeholder={t('common.search')}
          className="mb-4 max-w-sm"
        />
        <DataTable columns={columns} data={items} loading={isLoading} />
        <Pagination
          page={page}
          totalItems={total}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
};

export default InventoryPage;
