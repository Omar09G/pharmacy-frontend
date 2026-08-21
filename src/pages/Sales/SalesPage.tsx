import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from '@tanstack/react-table';
import { saleApi } from '../../services/saleApi';
import type { Sale, SaleItem } from '../../models/sale.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { showSuccess, showApiError, confirmDelete } from '../../utils/alerts';
import { formatLocal, getCurrentDate } from '../../utils/dateUtils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import DateRangeInput from '../../components/ui/DateRangeInput';
import Badge from '../../components/ui/Badge';
import { EyeIcon, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useCrudModal } from '../../hooks/useCrudModal';

const SalesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [dateInit, setDateInit] = useState(getCurrentDate());
  const [dateEnd, setDateEnd] = useState(getCurrentDate());
  const { open, openCreate, close } = useCrudModal<Sale>();
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  const { data: saleDetailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['saleDetails', selectedSaleId],
    queryFn: () => saleApi.getSaleDetails(selectedSaleId!),
    enabled: selectedSaleId !== null,
  });
  const saleItems: SaleItem[] = saleDetailsData?.data ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page, pageSize, dateInit, dateEnd],
    queryFn: () => saleApi.getAll(page, pageSize, 0, dateInit, dateEnd),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  /* Get Total Page */
  const total = data?.total ?? 0;
  /* Function to calculate the total sum of sales on the current page */
  const getTotalSum = () => {
    return items
      .reduce((acc, item) => acc + Number(item.total ?? 0), 0)
      .toFixed(2);
  };

  const cancelMut = useMutation({
    mutationFn: (id: number) => saleApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      showSuccess(t('sales.cancelled'));
    },
    onError: (err) => showApiError(err),
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

  const handleViewDetails = (item: Sale) => {
    setSelectedSaleId(item.id);
    openCreate();
  };

  const columnsSaleItem: ColumnDef<SaleItem>[] = [
    {
      accessorKey: 'productName',
      header: t('products.productName'),
    },
    {
      accessorKey: 'qty',
      header: t('sales.items'),
      cell: ({ getValue }) => {
        const qty = Number(getValue() ?? 0).toFixed(0);
        return `${qty} ${Number(qty) > 1 ? t('common.units') : t('common.unit')}`;
      },
    },
    {
      accessorKey: 'unitPrice',
      header: t('common.price'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
    },
    {
      accessorKey: 'discount',
      header: t('pos.discount'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
    },
    {
      accessorKey: 'taxAmount',
      header: t('pos.tax'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
    },
    {
      accessorKey: 'lineTotal',
      header: t('pos.subtotal'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
    },
  ];

  const columns: ColumnDef<Sale>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    {
      accessorKey: 'customerName',
      header: t('customers.fullName'),
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge color="purple">{s}</Badge>;
      },
      size: 150,
    },
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
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge color="gray">{`$${Number(s ?? 0).toFixed(2)}`}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge color={statusColor(s)}>{s.toUpperCase()}</Badge>;
      },
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            title={t('tooltips.viewDetails')}
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row.original)}
            disabled={row.original.status === 'cancelled'}
          >
            <EyeIcon size={16} className="text-blue-500" />
          </Button>
          <Button
            title={t('tooltips.cancelSale')}
            variant="ghost"
            size="sm"
            onClick={() => handleCancel(row.original)}
            disabled={row.original.status === 'cancelled'}
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('sales.title')} - Total Page: ${getTotalSum()}
        </h1>
      </div>
      <Card>
        <DateRangeInput
          dateInit={dateInit}
          dateEnd={dateEnd}
          onDateInitChange={(v) => {
            setDateInit(v);
            setPage(1);
          }}
          onDateEndChange={(v) => {
            setDateEnd(v);
            setPage(1);
          }}
          labelInit={t('common.dateFrom')}
          labelEnd={t('common.dateTo')}
          className="mb-4"
        />
        <DataTable columns={columns} data={items} loading={isLoading} />
        <Pagination
          page={page}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
      <Modal open={open} onClose={close} title={t('sales.detail')} size="xl">
        <Card className="w-full">
          <DataTable
            columns={columnsSaleItem}
            data={saleItems}
            loading={isLoadingDetails}
          />
        </Card>
      </Modal>
    </div>
  );
};

export default SalesPage;
