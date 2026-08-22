import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { roleApi } from '../../../services/roleApi';
import type { Role, RoleCreate } from '../../../models/role.model';
import { DEFAULT_PAGE_SIZE } from '../../../utils/constants';
import {
  showSuccess,
  showApiError,
  confirmDelete,
} from '../../../utils/alerts';
import { useCrudModal } from '../../../hooks/useCrudModal';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { nowUTC } from '../../../utils/dateUtils';

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  description: z.string().default(''),
});
type FormData = z.infer<typeof schema>;

const RolesPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } = useCrudModal<Role>();

  const { data, isLoading } = useQuery({
    queryKey: ['roles', page, pageSize, search],
    queryFn: () =>
      search.trim().length > 0
        ? roleApi.getByName(search, page, pageSize, 0)
        : roleApi.getAll(page, pageSize, 0),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  const createMut = useMutation({
    mutationFn: (d: RoleCreate) => roleApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      showSuccess(t('roles.created'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Role> }) =>
      roleApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      showSuccess(t('roles.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => roleApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      showSuccess(t('roles.deleted'));
    },
    onError: (err) => showApiError(err),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      updateMut.mutate({
        id: editing.id,
        data: { ...d, createdAt: editing.createdAt },
      });
    } else {
      const createdAt = nowUTC();
      createMut.mutate({ id: 0, ...d, createdAt } as RoleCreate);
    }
  };

  const handleEdit = (item: Role) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          name: item.name,
          description: item.description || '',
        }),
      10,
    );
  };
  const handleDelete = async (item: Role) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({ name: '', description: '' });
    openCreate();
  };

  const columns: ColumnDef<Role>[] = [
    // { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('roles.roleName') },
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
          {t('roles.title')}
        </h1>
        <Button title={t('tooltips.newRole')} onClick={handleCreate}>
          <Plus size={16} /> {t('roles.newRole')}
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
        title={editing ? t('roles.editRole') : t('roles.newRole')}
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
          className="grid grid-cols-1 gap-4"
        >
          <Input
            label={t('roles.roleName')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
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

export default RolesPage;
