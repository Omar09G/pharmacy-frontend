import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import api from '../../../../api/axiosInstance';
import type { ApiResponse } from '../../../../utils/Utils';
import { DEFAULT_PAGE_SIZE } from '../../../../utils/constants';
import {
  showSuccess,
  showError,
  confirmDelete,
} from '../../../../utils/alerts';
import { useCrudModal } from '../../../../hooks/useCrudModal';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import DataTable from '../../../../components/ui/DataTable';
import Pagination from '../../../../components/ui/Pagination';
import SearchInput from '../../../../components/ui/SearchInput';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Badge from '../../../../components/ui/Badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface TaxProfile {
  id: number;
  name: string;
  rate: number;
  isInclusive: boolean;
  description?: string;
}

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  rate: z.coerce.number<number>().min(0, 'Requerido').max(100),
  isInclusive: z.boolean().catch(true),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const taxApiPath = '/tax_profiles';
const taxApiFn = {
  getAll: (page: number, limit: number, total?: number) =>
    api
      .get<
        ApiResponse<TaxProfile[]>
      >(taxApiPath, { params: { page, limit, total } })
      .then((r) => r.data),
  create: (payload: Omit<TaxProfile, 'id'>) =>
    api
      .put<ApiResponse<TaxProfile>>(taxApiPath, { id: 0, ...payload })
      .then((r) => r.data),
  update: (id: number, payload: Partial<TaxProfile>) =>
    api
      .patch<ApiResponse<TaxProfile>>(`${taxApiPath}/${id}`, payload)
      .then((r) => r.data),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`${taxApiPath}/${id}`).then((r) => r.data),
};

const TaxProfilesPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<TaxProfile>();

  const { data, isLoading } = useQuery({
    queryKey: ['taxProfiles', page, search],
    queryFn: () => taxApiFn.getAll(page, DEFAULT_PAGE_SIZE, 0),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: (d: FormData) => taxApiFn.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxProfiles'] });
      showSuccess(t('config.taxCreated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<TaxProfile> }) =>
      taxApiFn.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxProfiles'] });
      showSuccess(t('config.taxUpdated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => taxApiFn.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxProfiles'] });
      showSuccess(t('config.taxDeleted'));
    },
    onError: () => showError(t('common.error')),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: d });
    } else {
      createMut.mutate(d);
    }
  };

  const handleEdit = (item: TaxProfile) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          name: item.name,
          rate: item.rate,
          isInclusive: item.isInclusive,
          description: item.description,
        }),
      10,
    );
  };
  const handleDelete = async (item: TaxProfile) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({ name: '', rate: 0, isInclusive: true, description: '' });
    openCreate();
  };

  const columns: ColumnDef<TaxProfile>[] = [
    //{ accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('config.taxName') },
    {
      accessorKey: 'rate',
      header: t('config.taxRate'),
      cell: ({ getValue }) => `${Number(getValue() ?? 0).toFixed(2)}%`,
    },
    {
      accessorKey: 'description',
      header: t('config.taxDescription'),
    },
    {
      accessorKey: 'isInclusive',
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
          {t('config.taxes')}
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('config.newTax')}
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
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      <Modal
        open={open}
        onClose={close}
        title={editing ? t('config.editTax') : t('config.newTax')}
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
            label={t('config.taxName')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label={t('config.taxRate')}
            type="number"
            step="0.01"
            {...form.register('rate')}
            error={form.formState.errors.rate?.message}
          />
          <Input
            label={t('config.taxDescription')}
            {...form.register('description')}
            error={form.formState.errors.description?.message}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              {...form.register('isInclusive')}
              className="rounded"
            />
            {t('common.active')}
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default TaxProfilesPage;
