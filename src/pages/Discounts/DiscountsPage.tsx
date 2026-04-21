import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { discountApi } from '../../services/discountApi';
import type { Discount, DiscountCreate } from '../../models/discount.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { showSuccess, showApiError, confirmDelete } from '../../utils/alerts';
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
import { dateToUTC, nowUTC, utcToLocalInput } from '../../utils/dateUtils';
import Select from '../../components/ui/Select';
import { useAuthStore } from '../../store/authStore';
import { categoryApi } from '../../services/categoryApi';
import { Category } from '../../models/category.model';

const schema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Requerido'),
  description: z.string().optional(),
  discountType: z.string(),
  value: z.coerce.number<number>().min(0, 'Requerido').max(100, 'Máximo 100'),
  appliesTo: z.string(),
  productId: z.coerce.number<number>().optional(),
  categoryId: z.coerce.number<number>().optional(),
  customerId: z.coerce.number<number>().optional(),
  minQty: z.coerce.number<number>().optional(),
  maxUses: z.coerce.number<number>().optional(),
  priority: z.coerce.number<number>().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const DiscountsPage: React.FC = () => {
  const { user } = useAuthStore.getState();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Discount>();

  const { data, isLoading } = useQuery({
    queryKey: ['discounts', page, pageSize, search],
    queryFn: () => discountApi.getAll(page, pageSize),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  //Categorias
  const { data: categoriesData } = useQuery({
    queryKey: ['pos-categories'],
    queryFn: () => categoryApi.getAll(1, 100),
  });

  const categories: Category[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : [];

  const categoryOptions = [
    { label: '—', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  const createMut = useMutation({
    mutationFn: (d: DiscountCreate) => discountApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      showSuccess(t('discounts.created'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Discount> }) =>
      discountApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      showSuccess(t('discounts.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => discountApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discounts'] });
      showSuccess(t('discounts.deleted'));
    },
    onError: (err) => showApiError(err),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      const starDate = dateToUTC(d.startAt as string);
      const endDate = dateToUTC(d.endAt as string);

      const payload = {
        createdAt: nowUTC(),
        createdBy: user?.id,
        ...d,
        startAt: starDate,
        endAt: endDate,
      };
      updateMut.mutate({ id: editing.id, data: payload });
    } else {
      // Convertir nuevamente las fechas a UTC para enviarlas al backend
      const starDate = dateToUTC(d.startAt as string);
      const endDate = dateToUTC(d.endAt as string);

      const payload: DiscountCreate = {
        id: 0,
        createdAt: nowUTC(),
        createdBy: user?.id,
        ...d,
        startAt: starDate,
        endAt: endDate,
      };

      createMut.mutate(payload);
    }
  };

  const handleEdit = (item: Discount) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          code: item.code,
          name: item.name,
          description: item.description,
          discountType: item.discountType,
          value: item.value,
          appliesTo: item.appliesTo,
          productId: item.productId,
          categoryId: item.categoryId,
          customerId: item.customerId,
          minQty: item.minQty,
          maxUses: item.maxUses,
          priority: item.priority,
          startAt: utcToLocalInput(item.startAt ?? '')?.slice(0, 10) ?? '',
          endAt: utcToLocalInput(item.endAt ?? '')?.slice(0, 10) ?? '',
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
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      value: 0,
      appliesTo: 'All',
      productId: undefined,
      categoryId: undefined,
      customerId: undefined,
      minQty: undefined,
      maxUses: undefined,
      priority: undefined,
      startAt: undefined,
      endAt: undefined,
      active: true,
    });
    openCreate();
  };

  const columns: ColumnDef<Discount>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('discounts.discountName') },
    {
      accessorKey: 'code',
      header: t('discounts.code'),
      cell: ({ getValue }) => getValue() ?? '—',
    },
    {
      accessorKey: 'value',
      header: t('discounts.value'),
      cell: ({ getValue }) => `${Number(getValue() ?? 0).toFixed(2)}`,
    },
    {
      accessorKey: 'startAt',
      header: t('discounts.startDate'),
      cell: ({ getValue }) =>
        utcToLocalInput(getValue() as string)?.slice(0, 10) ?? '—',
    },
    {
      accessorKey: 'endAt',
      header: t('discounts.endDate'),
      cell: ({ getValue }) =>
        utcToLocalInput(getValue() as string)?.slice(0, 10) ?? '—',
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
            title={t('tooltips.edit')}
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil size={16} />
          </Button>
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
          {t('discounts.title')}
        </h1>
        <Button title={t('tooltips.newDiscount')} onClick={handleCreate}>
          <Plus size={16} /> {t('discounts.newDiscount')}
        </Button>
      </div>
      <Card>
        <SearchInput
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t('common.search')}
          className="mb-4 max-w-sm"
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
        title={
          editing ? t('discounts.editDiscount') : t('discounts.newDiscount')
        }
        size="lg"
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
          className="grid grid-cols-5 md:grid-cols-2 gap-4"
        >
          <Input
            label={t('discounts.code')}
            {...form.register('code')}
            error={form.formState.errors.code?.message}
          />
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
            label={t('discounts.discountType')}
            step="0.01"
            {...form.register('discountType')}
          />
          <Input
            label={t('discounts.value')}
            type="number"
            step="0.01"
            {...form.register('value')}
          />
          <Input
            label={t('discounts.appliesTo')}
            {...form.register('appliesTo')}
          />
          <Select
            label={t('discounts.category')}
            {...form.register('categoryId')}
            options={categoryOptions}
          />
          <Input
            label={t('discounts.minQty')}
            type="number"
            step="0.01"
            {...form.register('minQty')}
          />
          <Input
            label={t('discounts.maxUses')}
            type="number"
            step="0.01"
            {...form.register('maxUses')}
          />
          <Input
            label={t('discounts.priority')}
            type="number"
            step="0.01"
            {...form.register('priority')}
          />
          <Input
            label={t('discounts.startDate')}
            type="date"
            {...form.register('startAt')}
          />
          <Input
            label={t('discounts.endDate')}
            type="date"
            {...form.register('endAt')}
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
