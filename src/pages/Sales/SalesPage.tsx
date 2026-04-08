import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from '@tanstack/react-table';
import { saleApi } from '../../services/saleApi';
import type { Sale } from '../../models/sale.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { showSuccess, showError, confirmDelete } from '../../utils/alerts';
import { formatLocal } from '../../utils/dateUtils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import Badge from '../../components/ui/Badge';
import { Trash2 } from 'lucide-react';

const SalesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page, search],
    queryFn: () => saleApi.getAll(page, DEFAULT_PAGE_SIZE),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const cancelMut = useMutation({
    mutationFn: (id: number) => saleApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      showSuccess(t('sales.cancelled'));
    },
    onError: () => showError(t('common.error')),
  });

  const handleCancel = async (item: Sale) => {
    const r = await confirmDelete(`#${item.id}`);
    if (r.isConfirmed) cancelMut.mutate(item.id);
  };

  const statusColor = (status: string): 'green' | 'red' | 'yellow' | 'gray' => {
    if (status === 'completed') return 'green';
    if (status === 'cancelled') return 'red';
    if (status === 'pending') return 'yellow';
    return 'gray';
  };

  const columns: ColumnDef<Sale>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'customerId', header: t('sales.customer') },
    {
      accessorKey: 'date',
      header: t('sales.saleDate'),
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? formatLocal(v, i18n.language) : '—';
      },
    },
    {
      accessorKey: 'total',
      header: t('common.total'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge color={statusColor(s)}>{s}</Badge>;
      },
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCancel(row.original)}
          disabled={row.original.status === 'cancelled'}
        >
          <Trash2 size={16} className="text-red-500" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('sales.title')}
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

export default SalesPage;
