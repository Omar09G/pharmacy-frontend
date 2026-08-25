import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from '@tanstack/react-table';
import { inventoryApi } from '../../services/inventoryApi';
import { dashboardApi } from '../../services/dashboardApi';
import type {
  InventoryMovement,
  ProductLot,
} from '../../models/inventory.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { formatLocal, getCurrentDate } from '../../utils/dateUtils';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import DateRangeInput from '../../components/ui/DateRangeInput';
import Button from '../../components/ui/Button';
import {
  BanIcon,
  PackagePlus,
  SaveIcon,
  SlidersHorizontal,
} from 'lucide-react';
import Badge, { type BadgeTone } from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { z } from 'zod';
import { useWatch, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { showError, showSuccess, showApiError } from '../../utils/alerts';

type StockOperation = 'restock' | 'adjust';

const REASON_TONES: Record<string, BadgeTone> = {
  sale: 'success',
  restock: 'brand',
  purchase: 'brand',
  adjustment: 'warning',
};

const stockTone = (qty: number): BadgeTone => {
  if (qty <= 3) return 'danger';
  if (qty <= 10) return 'warning';
  return 'neutral';
};

const InventoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [dateInit, setDateInit] = useState(getCurrentDate());
  const [dateEnd, setDateEnd] = useState(getCurrentDate());
  // 'restock' adds to current stock; 'adjust' sets the exact physical count.
  const [operation, setOperation] = useState<StockOperation>('restock');
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [lowStockOpen, setLowStockOpen] = useState(false);
  const [loadedLot, setLoadedLot] = useState<ProductLot | null>(null);

  const schema = z.object({
    id: z.coerce.number<number>().min(0).catch(0),
    productId: z.coerce.number<number>().min(0).catch(0),
    qtyOnHand: z.coerce.number<number>().min(0, 'Requerido'),
    expiryDate: z.string().catch(''),
  });
  type FormDataStock = z.infer<typeof schema>;

  const form = useForm<FormDataStock>({
    resolver: zodResolver(schema) as unknown as Resolver<FormDataStock>,
    defaultValues: { id: 0, productId: 0, qtyOnHand: 0, expiryDate: '' },
  });
  const watchedQty = useWatch({
    control: form.control,
    name: 'qtyOnHand',
    defaultValue: 0,
  });
  const qtyValue = Number(watchedQty ?? 0);
  const currentQty = Number(loadedLot?.qtyOnHand ?? 0);
  const resultingQty =
    operation === 'restock' ? currentQty + qtyValue : qtyValue;

  const saveMut = useMutation({
    mutationFn: ({
      id,
      data: d,
      op,
    }: {
      id: number;
      data: FormDataStock;
      op: StockOperation;
    }) =>
      inventoryApi.updateStock(
        id,
        {
          productId: d.productId,
          lotNumber: loadedLot?.lotNumber ?? '',
          qtyOnHand: d.qtyOnHand,
          expiryDate: d.expiryDate || null,
          purchaseId: loadedLot?.purchaseId ?? null,
        },
        op === 'adjust' ? 'adjust' : 'update',
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      showSuccess(t('inventory.updated'));
      closeStockModal();
    },
    onError: (err) => showApiError(err),
  });

  const closeStockModal = () => {
    setStockModalOpen(false);
    setLoadedLot(null);
    form.reset({ id: 0, productId: 0, qtyOnHand: 0, expiryDate: '' });
  };

  const openOperation = (op: StockOperation) => {
    setOperation(op);
    setLowStockOpen(false);
    setStockModalOpen(true);
    setLoadedLot(null);
    form.reset({ id: 0, productId: 0, qtyOnHand: 0, expiryDate: '' });
  };

  // Barcode input is kept as an uncontrolled ref so Enter triggers lookup.
  const lookupRef = React.useRef<HTMLInputElement>(null);

  const doLookup = async (barcode: string) => {
    if (!barcode.trim()) return;
    try {
      const res = await inventoryApi.getStockByBarCode(barcode.trim());
      if (res.data) {
        const lot = res.data as unknown as ProductLot;
        setLoadedLot(lot);
        form.setValue('id', lot.id);
        form.setValue(
          'productId',
          typeof lot.productId === 'string'
            ? Number(lot.productId)
            : (lot.productId ?? 0),
        );
        form.setValue(
          'expiryDate',
          lot.expiryDate ? String(lot.expiryDate).slice(0, 10) : '',
        );
      } else {
        showError(t('inventory.notFound'));
      }
    } catch {
      showError(t('inventory.notFound'));
    }
  };

  const onSubmitStock = (d: FormDataStock) => {
    if (!d.id) {
      showError(t('inventory.noLotSelected'));
      return;
    }
    saveMut.mutate({ id: d.id, data: d, op: operation });
  };

  const handleCreate = () => {
    setOperation('restock');
    setLowStockOpen(false);
    setStockModalOpen(true);
    form.reset({ id: 0, productId: 0, qtyOnHand: 0, expiryDate: '' });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, pageSize, dateInit, dateEnd],
    queryFn: () =>
      inventoryApi.getMovements(page, pageSize, 0, dateInit, dateEnd),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  // Low stock overview: lowest quantities first.
  const { data: stockRes, isLoading: stockLoading } = useQuery({
    queryKey: ['lowStockList'],
    queryFn: () => dashboardApi.getInventoryStock(1, 500),
    enabled: lowStockOpen,
  });
  const lowStockItems = (Array.isArray(stockRes?.data) ? stockRes.data : [])
    .slice()
    .sort((a, b) => Number(a.qtyOnHand ?? 0) - Number(b.qtyOnHand ?? 0))
    .slice(0, 25);

  const columns: ColumnDef<InventoryMovement>[] = [
    {
      header: t('inventory.inventoryMovement.id'),
      accessorKey: 'id',
    },
    {
      header: t('inventory.inventoryMovement.movementType'),
      accessorKey: 'reason',
      cell: ({ getValue }) => {
        const reason = getValue() as string;
        return <Badge tone={REASON_TONES[reason] ?? 'danger'}>{reason}</Badge>;
      },
    },
    {
      header: t('inventory.inventoryMovement.quantity'),
      accessorKey: 'changeQty',
      cell: ({ getValue }) => {
        const qty = getValue() as number;
        return (
          <Badge tone={qty > 0 ? 'success' : 'danger'}>
            {qty > 0 ? '+' : ''}
            {Number(qty).toFixed(1)}
          </Badge>
        );
      },
    },
    {
      header: t('inventory.productName'),
      accessorKey: 'productName',
    },
    {
      header: t('inventory.inventoryMovement.saleId'),
      accessorKey: 'referenceId',
      cell: ({ getValue }) => {
        const referenceId = getValue() as string;
        return (
          <Badge tone={referenceId ? 'neutral' : 'danger'}>{referenceId}</Badge>
        );
      },
    },
    {
      header: t('inventory.inventoryMovement.createdAt'),
      accessorKey: 'createdAt',
      cell: (info) => formatLocal(info.getValue() as string, i18n.language),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        {t('inventory.title')}
      </h1>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          title={t('tooltips.updateStock')}
          variant="success"
          onClick={() => openOperation('restock')}
        >
          <PackagePlus size={16} /> {t('inventory.restock')}
        </Button>
        <Button
          title={t('tooltips.adjustStock')}
          variant="primary"
          onClick={() => openOperation('adjust')}
        >
          <SlidersHorizontal size={16} /> {t('inventory.adjustExact')}
        </Button>
        <Button
          title={t('tooltips.lowStock')}
          variant="secondary"
          onClick={() => {
            setStockModalOpen(false);
            setLowStockOpen(true);
          }}
        >
          {t('inventory.lowStock')}
        </Button>
      </div>

      <Card
        title={t('inventory.lastMovementAt')}
        actions={
          <Button
            title={t('inventory.updateStock')}
            variant="ghost"
            size="sm"
            onClick={handleCreate}
          >
            {t('inventory.getMovements')}
          </Button>
        }
      >
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

      {/* Stock operation modal (restock / adjust) */}
      <Modal
        open={stockModalOpen}
        onClose={closeStockModal}
        title={
          operation === 'restock'
            ? t('inventory.restock')
            : t('inventory.adjustExact')
        }
        footer={
          <>
            <Button
              title={t('tooltips.close')}
              variant="secondary"
              onClick={closeStockModal}
            >
              <BanIcon size={16} /> {t('common.cancel')}
            </Button>
            <Button
              title={t('tooltips.saveStock')}
              variant="primary"
              onClick={form.handleSubmit(onSubmitStock)}
              loading={saveMut.isPending}
            >
              <SaveIcon size={16} /> {t('common.confirm')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="rounded-md bg-info/10 px-3 py-2 text-xs text-muted">
            {operation === 'restock'
              ? t('inventory.restockHelp')
              : t('inventory.adjustHelp')}
          </p>

          <Input
            ref={lookupRef}
            placeholder={t('inventory.scanHint')}
            label={t('inventory.barcode')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                void doLookup((e.target as HTMLInputElement).value);
              }
            }}
          />

          {loadedLot ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border border-line px-3 py-2 text-sm sm:grid-cols-3">
              <dt className="text-muted">{t('inventory.lotNumber')}</dt>
              <dd className="text-ink">{loadedLot.lotNumber ?? '—'}</dd>
              <dt className="text-muted">{t('inventory.currentQty')}</dt>
              <dd className="font-mono tabular-nums font-semibold text-ink">
                {currentQty}
              </dd>
            </dl>
          ) : (
            <p className="text-xs italic text-muted">
              {t('inventory.noLotSelected')}
            </p>
          )}

          <Input
            label={t('inventory.inventoryMovement.quantity')}
            type="number"
            step="0.01"
            min="0"
            {...form.register('qtyOnHand')}
            error={form.formState.errors.qtyOnHand?.message}
          />
          <Input
            label={t('inventory.expiryDate')}
            type="date"
            {...form.register('expiryDate')}
          />

          <div className="flex items-center justify-between rounded-md border border-line bg-neutral-50 px-3 py-2 dark:bg-neutral-800/50">
            <span className="text-sm font-medium text-muted">
              {t('inventory.resultQty')}
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-brand">
              {resultingQty.toFixed(2)}
            </span>
          </div>
        </div>
      </Modal>

      {/* Low stock overview (read-only) */}
      <Modal
        open={lowStockOpen}
        onClose={() => setLowStockOpen(false)}
        title={t('inventory.lowStockList')}
      >
        <DataTable
          columns={[
            {
              header: t('inventory.productName'),
              accessorKey: 'productName',
            },
            {
              header: t('inventory.qtyOnHand'),
              accessorKey: 'qtyOnHand',
              cell: ({ getValue }) => {
                const q = Number(getValue() ?? 0);
                return <Badge tone={stockTone(q)}>{q}</Badge>;
              },
            },
            {
              header: t('inventory.maxExpiryDate'),
              accessorKey: 'maxExpiryDate',
              cell: ({ getValue }) => {
                const v = getValue() as string | null;
                return v ? formatLocal(v, i18n.language) : '—';
              },
            },
          ]}
          data={lowStockItems}
          loading={stockLoading}
          emptyMessage={t('common.noData')}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;
