import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { purchaseApi } from '../../services/purchaseApi';
import type { Purchase, PurchaseCreate } from '../../models/purchase.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { showSuccess, showError, confirmDelete } from '../../utils/alerts';
import { useCrudModal } from '../../hooks/useCrudModal';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Select from '../../components/ui/Select';

const schema = z.object({
  supplierId: z.coerce.number<number>().min(1, 'Requerido'),
  date: z.string().min(1, 'Requerido'),
  invoiceNo: z.string().catch(''),
  notes: z.string().catch(''),
  status: z.string().catch(''),
});
type FormData = z.infer<typeof schema>;

const PurchasesPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Purchase>();

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', page, search],
    queryFn: () => purchaseApi.getAll(page, DEFAULT_PAGE_SIZE),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: (d: PurchaseCreate) => purchaseApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      showSuccess(t('purchases.created'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Purchase> }) =>
      purchaseApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      showSuccess(t('purchases.updated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => purchaseApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      showSuccess(t('purchases.deleted'));
    },
    onError: () => showError(t('common.error')),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: d });
    } else {
      createMut.mutate({
        id: 0,
        userId: 0,
        items: [],
        payment: { id: 0, paymentMethodId: 1, amount: 0, reference: '' },
        ...d,
      } as PurchaseCreate);
    }
  };

  const handleEdit = (item: Purchase) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          supplierId: item.supplierId,
          date: item.date?.slice(0, 10) ?? '',
          invoiceNo: item.invoiceNo,
          notes: item.notes,
          status: item.status,
        }),
      10,
    );
  };
  const handleDelete = async (item: Purchase) => {
    const r = await confirmDelete(`#${item.id}`);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({
      supplierId: 0,
      date: '',
      invoiceNo: '',
      notes: '',
      status: '',
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
        <Badge
          color={(getValue() as string) === 'COMPLETED' ? 'green' : 'gray'}
        >
          {getValue() as string}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil size={16} />
          </Button>
          <Button
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
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('purchases.newPurchase')}
        </Button>
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

      <Modal
        open={open}
        onClose={close}
        title={
          editing ? t('purchases.editPurchase') : t('purchases.newPurchase')
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => form.reset()}>
              {t('common.clear')}
            </Button>
            <Button variant="secondary" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button
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
          <Input
            label={t('purchases.supplierId')}
            type="number"
            {...form.register('supplierId')}
            error={form.formState.errors.supplierId?.message}
            disabled={!!editing}
          />
          <Input
            label={t('purchases.purchaseDate')}
            type="date"
            {...form.register('date')}
            error={form.formState.errors.date?.message}
            disabled={!!editing}
          />
          <Input
            label={t('purchases.invoiceNumber')}
            {...form.register('invoiceNo')}
            disabled={!!editing}
          />
          <Input label={t('purchases.notes')} {...form.register('notes')} />
          <Select
            label={t('commons.status')}
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
