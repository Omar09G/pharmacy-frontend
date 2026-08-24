import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { locationApiFn, type Location } from '../../../../services/locationApi';
import { DEFAULT_PAGE_SIZE } from '../../../../utils/constants';
import {
  showSuccess,
  showApiError,
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

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  type: z.string().min(1, 'Requerido'),
  description: z.string().default(''),
});
type FormData = z.infer<typeof schema>;

const LocationsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Location>();

  const { data, isLoading } = useQuery({
    queryKey: ['locations', page, pageSize, search],
    queryFn: () => locationApiFn.getAll(page, pageSize, 0),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  const createMut = useMutation({
    mutationFn: (d: FormData) => locationApiFn.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      showSuccess(t('config.locationCreated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Location> }) =>
      locationApiFn.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      showSuccess(t('config.locationUpdated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => locationApiFn.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      showSuccess(t('config.locationDeleted'));
    },
    onError: (err) => showApiError(err),
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
    });
    openCreate();
  };

  const columns: ColumnDef<Location>[] = [
    //{ accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('config.locationName') },
    { accessorKey: 'type', header: t('config.locationType') },
    { accessorKey: 'description', header: t('common.description') },
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
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {t('config.locations')}
        </h1>
        <Button title={t('tooltips.newLocation')} onClick={handleCreate}>
          <Plus size={16} /> {t('config.newLocation')}
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
        title={editing ? t('config.editLocation') : t('config.newLocation')}
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
        </form>
      </Modal>
    </div>
  );
};

export default LocationsPage;
