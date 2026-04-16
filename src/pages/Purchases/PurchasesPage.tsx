import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { purchaseApi } from '../../services/purchaseApi';
import type {
  Purchase,
  PurchaseCreate,
  PurchaseUpdate,
} from '../../models/purchase.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import {
  showSuccess,
  showApiError,
  confirmDelete,
  confirmUpdate,
} from '../../utils/alerts';
import { useCrudModal } from '../../hooks/useCrudModal';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import DateRangeInput from '../../components/ui/DateRangeInput';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Select from '../../components/ui/Select';
import { supplierApi } from '../../services/supplierApi';
import { paymentMethodApi } from '../../services/paymentMethodApi';
import { useAuthStore } from '../../store/authStore';
import { nowUTC, getCurrentDate } from '../../utils/dateUtils';

const schema = z.object({
  supplierId: z.coerce.number<number>().min(1, 'Requerido'),
  invoiceNo: z.string().catch(''),
  subtotal: z.coerce.number<number>().min(0, 'Requerido'),
  taxTotal: z.coerce.number<number>().min(0, 'Requerido'),
  total: z.coerce.number<number>().min(0, 'Requerido'),
  status: z.string().catch('PENDING'),
  methodId: z.coerce.number<number>().min(1, 'Requerido'),
});
type FormData = z.infer<typeof schema>;

const PurchasesPage: React.FC = () => {
  const { user } = useAuthStore.getState();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [dateInit, setDateInit] = useState(getCurrentDate());
  const [dateEnd, setDateEnd] = useState(getCurrentDate());
  const { open, openCreate, close } = useCrudModal<Purchase>();

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', page, pageSize, dateInit, dateEnd],
    queryFn: () => purchaseApi.getAll(page, pageSize, 0, dateInit, dateEnd),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  //Carga de proveedores para el select
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers', 1, ''],
    queryFn: () => supplierApi.getAll(1, 1000, 0), // Carga los primeros 1000 proveedores
  });

  const suppliers = Array.isArray(suppliersData?.data)
    ? suppliersData.data
    : [];

  //Carga de métodos de pago para el select
  const { data: paymentMethodsData } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => paymentMethodApi.getAll(1, 1000, 0), // Carga los primeros 1000 métodos de pago
  });
  const paymentMethods = Array.isArray(paymentMethodsData?.data)
    ? paymentMethodsData.data
    : [];

  //Carga de IVA para el select
  const { data: taxData } = useQuery({
    queryKey: ['taxes'],
    queryFn: () => purchaseApi.getAllTax(1, 1000, 0), // Carga los primeros 1000 impuestos
  });
  const taxes = Array.isArray(taxData?.data) ? taxData.data : [];

  const createMut = useMutation({
    mutationFn: (d: PurchaseCreate) => purchaseApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      showSuccess(t('purchases.created'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: PurchaseUpdate }) =>
      purchaseApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      showSuccess(t('purchases.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => purchaseApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      showSuccess(t('purchases.deleted'));
    },
    onError: (err) => showApiError(err),
  });

  const onSubmit = (d: FormData) => {
    const payload: PurchaseCreate = {
      ...d,
      createdAt: nowUTC(),
      date: nowUTC(),
      createdBy: user?.id || 0, // Aquí deberías usar el ID del usuario actual
      payment: {
        amount: d.total,
        methodId: d.methodId,
        paidAt: nowUTC(),
        purchaseId: 0, // Este campo se actualizará en el backend con el ID de la compra creada
      },
    };
    createMut.mutate(payload);
  };

  const handleEdit = async (item: Purchase) => {
    const payload: PurchaseUpdate = {
      id: item.id,
      status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
    };
    const r = await confirmUpdate(
      `#${item.id} a estado ${item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'}`,
    );
    if (r.isConfirmed) updateMut.mutate({ id: item.id, data: payload });
  };

  const handleDelete = async (item: Purchase) => {
    const r = await confirmDelete(`#${item.id}`);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({
      supplierId: suppliers.length > 0 ? suppliers[0].id : 0,
      invoiceNo: '',
      subtotal: 0,
      taxTotal: taxes.length > 0 ? taxes[0].rate : 0,
      total: 0,
      methodId: paymentMethods.length > 0 ? paymentMethods[0].id : 0,
      status: 'PENDING',
    });
    openCreate();
  };

  const columns: ColumnDef<Purchase>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'supplierId', header: t('purchases.supplier') },
    {
      accessorKey: 'date',
      header: t('purchases.purchaseDate'),
      cell: ({ getValue }) => (getValue() as string)?.slice(0, 10) ?? '—',
    },
    { accessorKey: 'invoiceNo', header: t('purchases.invoiceNumber') },
    {
      accessorKey: 'total',
      header: t('common.total'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ getValue }) => (
        <Badge color={(getValue() as string) === 'COMPLETED' ? 'green' : 'red'}>
          {getValue() as string}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.status === 'PENDING' ? (
            <Button
              title={t('tooltips.edit')}
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Pencil size={16} />
            </Button>
          ) : null}

          <Button
            title={t('tooltips.delete')}
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
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
          {t('purchases.title')}
        </h1>
        <Button title={t('tooltips.newPurchase')} onClick={handleCreate}>
          <Plus size={16} /> {t('purchases.newPurchase')}
        </Button>
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

      <Modal
        open={open}
        onClose={close}
        title={t('purchases.newPurchase')}
        footer={
          <>
            <Button
              title={t('tooltips.clear')}
              variant="secondary"
              onClick={() => form.reset()}
            >
              {t('common.clear')}
            </Button>
            <Button
              title={t('tooltips.cancel')}
              variant="secondary"
              onClick={close}
            >
              {t('common.cancel')}
            </Button>
            <Button
              title={t('tooltips.save')}
              onClick={form.handleSubmit(onSubmit)}
              loading={createMut.isPending || updateMut.isPending}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Select
            label={t('purchases.supplierId')}
            options={suppliers.map((s) => ({
              label: s.name,
              value: s.id,
            }))}
            {...form.register('supplierId')}
            error={form.formState.errors.supplierId?.message}
          />
          <Input
            label={t('purchases.purchaseDate')}
            value={nowUTC().slice(0, 10)}
            type="date"
            disabled={true}
          />
          <Input
            label={t('purchases.invoiceNumber')}
            {...form.register('invoiceNo')}
          />
          <Input
            label={t('pos.subtotal')}
            type="number"
            {...form.register('subtotal')}
            error={form.formState.errors.subtotal?.message}
            onChange={(e) => {
              const subtotal = parseFloat(e.target.value) || 0;

              const taxRate =
                taxes.length > 0
                  ? parseFloat(
                      form.getValues('taxTotal') as unknown as string,
                    ) || 0
                  : 0;
              form.setValue('total', subtotal + subtotal * taxRate);
            }}
          />
          <Select
            label={t('pos.tax')}
            options={taxes.map((t) => ({
              label: `${t.rate}%`,
              value: `${t.rate}`,
            }))}
            {...form.register('taxTotal')}
            error={form.formState.errors.taxTotal?.message}
            onChange={(e) => {
              const subtotal =
                parseFloat(form.getValues('subtotal') as unknown as string) ||
                0;
              const taxRate =
                taxes.length > 0 ? parseFloat(e.target.value) || 0 : 0;
              form.setValue('total', subtotal + subtotal * taxRate);
            }}
          />

          <Input
            label={t('common.total')}
            type="number"
            {...form.register('total')}
            error={form.formState.errors.total?.message}
            disabled={true}
          />
          <Select
            label={t('paymentMethods.title')}
            {...form.register('methodId')}
            options={paymentMethods.map((m) => ({
              label: m.name,
              value: m.id,
            }))}
            error={form.formState.errors.methodId?.message}
          ></Select>
          <Select
            label={t('common.status')}
            {...form.register('status')}
            options={[
              { label: t('purchases.status.completed'), value: 'COMPLETED' },
              { label: t('purchases.status.pending'), value: 'PENDING' },
            ]}
          ></Select>
        </form>
      </Modal>
    </div>
  );
};

export default PurchasesPage;
