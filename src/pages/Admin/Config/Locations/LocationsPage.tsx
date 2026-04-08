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
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  type: string;
  description: string;
  active: boolean;
}

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  type: z.string().min(1, 'Requerido'),
  description: z.string().catch(''),
  active: z.boolean().catch(true),
});
type FormData = z.infer<typeof schema>;

const locationApiPath = '/inventory_locations';
const locationApiFn = {
  getAll: (page: number, limit: number, total?: number) =>
    api
      .get<
        ApiResponse<Location[]>
      >(locationApiPath, { params: { page, limit, total } })
      .then((r) => r.data),
  create: (payload: Omit<Location, 'id'>) =>
    api
      .put<ApiResponse<Location>>(locationApiPath, { id: 0, ...payload })
      .then((r) => r.data),
  update: (id: number, payload: Partial<Location>) =>
    api
      .patch<ApiResponse<Location>>(`${locationApiPath}/${id}`, payload)
      .then((r) => r.data),
  delete: (id: number) =>
    api
      .delete<ApiResponse<null>>(`${locationApiPath}/${id}`)
      .then((r) => r.data),
};

const LocationsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Location>();

  const { data, isLoading } = useQuery({
    queryKey: ['locations', page, search],
    queryFn: () => locationApiFn.getAll(page, DEFAULT_PAGE_SIZE, 0),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: (d: FormData) => locationApiFn.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      showSuccess(t('config.locationCreated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Location> }) =>
      locationApiFn.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      showSuccess(t('config.locationUpdated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => locationApiFn.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      showSuccess(t('config.locationDeleted'));
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

  const handleEdit = (item: Location) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          name: item.name,
          type: item.type,
          description: item.description,
          active: item.active,
        }),
      10,
    );
  };
  const handleDelete = async (item: Location) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({
      name: '',
      type: '',
      description: '',
      active: true,
    });
    openCreate();
  };

  const columns: ColumnDef<Location>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('config.locationName') },
    { accessorKey: 'type', header: t('config.locationType') },
    { accessorKey: 'description', header: t('common.description') },
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
          {t('config.locations')}
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('config.newLocation')}
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
        title={editing ? t('config.editLocation') : t('config.newLocation')}
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
            label={t('config.locationName')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label={t('config.locationType')}
            {...form.register('type')}
            error={form.formState.errors.type?.message}
          />
          <Input
            label={t('common.description')}
            {...form.register('description')}
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

export default LocationsPage;
