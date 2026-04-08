import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { discountApi } from '../../services/discountApi';
import type { Discount, DiscountCreate } from '../../models/discount.model';
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

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  description: z.string().catch(''),
  percentage: z.coerce.number<number>().min(0).max(100).catch(0),
  value: z.coerce.number<number>().min(0).catch(0),
  startDate: z.string().catch(''),
  endDate: z.string().catch(''),
  active: z.boolean().catch(true),
});
type FormData = z.infer<typeof schema>;

const DiscountsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Discount>();

  const { data, isLoading } = useQuery({
    queryKey: ['discounts', page, search],
    queryFn: () => discountApi.getAll(page, DEFAULT_PAGE_SIZE),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: (d: DiscountCreate) => discountApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      showSuccess(t('discounts.created'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Discount> }) =>
      discountApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      showSuccess(t('discounts.updated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => discountApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      showSuccess(t('discounts.deleted'));
    },
    onError: () => showError(t('common.error')),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: d });
    } else {
      createMut.mutate({ id: 0, ...d } as DiscountCreate);
    }
  };

  const handleEdit = (item: Discount) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          name: item.name,
          description: item.description,
          percentage: item.percentage,
          value: item.value,
          startDate: item.startDate?.slice(0, 10) ?? '',
          endDate: item.endDate?.slice(0, 10) ?? '',
          active: item.active,
        }),
      10,
    );
  };
  const handleDelete = async (item: Discount) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({
      name: '',
      description: '',
      percentage: 0,
      value: 0,
      startDate: '',
      endDate: '',
      active: true,
    });
    openCreate();
  };

  const columns: ColumnDef<Discount>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('discounts.discountName') },
    {
      accessorKey: 'percentage',
      header: t('discounts.percentage'),
      cell: ({ getValue }) => `${Number(getValue() ?? 0).toFixed(2)}%`,
    },
    {
      accessorKey: 'value',
      header: t('discounts.value'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
    },
    {
      accessorKey: 'startAt',
      header: t('discounts.startDate'),
      cell: ({ getValue }) => (getValue() as string)?.slice(0, 10) ?? '—',
    },
    {
      accessorKey: 'endAt',
      header: t('discounts.endDate'),
      cell: ({ getValue }) => (getValue() as string)?.slice(0, 10) ?? '—',
    },
    {
      accessorKey: 'active',
      header: t('common.status'),
      cell: ({ getValue }) => (
        <Badge color={getValue() ? 'green' : 'red'}>
          {getValue() ? t('common.active') : t('common.inactive')}
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
          {t('discounts.title')}
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('discounts.newDiscount')}
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
          editing ? t('discounts.editDiscount') : t('discounts.newDiscount')
        }
        size="lg"
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
            label={t('discounts.discountName')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label={t('common.description')}
            {...form.register('description')}
          />
          <Input
            label={t('discounts.percentage')}
            type="number"
            step="0.01"
            {...form.register('percentage')}
          />
          <Input
            label={t('discounts.value')}
            type="number"
            step="0.01"
            {...form.register('value')}
          />
          <Input
            label={t('discounts.startDate')}
            type="date"
            {...form.register('startDate')}
          />
          <Input
            label={t('discounts.endDate')}
            type="date"
            {...form.register('endDate')}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              {...form.register('active')}
              className="rounded"
            />
            {t('common.active')}
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default DiscountsPage;
