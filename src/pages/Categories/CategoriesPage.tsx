import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { categoryApi } from '../../services/categoryApi';
import type { Category, CategoryCreate } from '../../models/category.model';
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
  active: z.boolean().catch(true),
});
type FormData = z.infer<typeof schema>;

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Category>();

  const { data, isLoading } = useQuery({
    queryKey: ['categories', page, search],
    queryFn: () =>
      categoryApi.getAll(page, DEFAULT_PAGE_SIZE, 0, search || undefined),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: (d: CategoryCreate) => categoryApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      showSuccess(t('categories.created'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Category> }) =>
      categoryApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      showSuccess(t('categories.updated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      showSuccess(t('categories.deleted'));
    },
    onError: () => showError(t('common.error')),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: d });
    } else {
      createMut.mutate({ id: 0, ...d } as CategoryCreate);
    }
  };

  const handleEdit = (item: Category) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          name: item.name,
          description: item.description,
          active: item.active,
        }),
      10,
    );
  };
  const handleDelete = async (item: Category) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({ name: '', description: '', active: true });
    openCreate();
  };

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('categories.categoryName') },
    { accessorKey: 'description', header: t('common.description') },
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
          {t('categories.title')}
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('categories.newCategory')}
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
          editing ? t('categories.editCategory') : t('categories.newCategory')
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
          className="grid grid-cols-1 gap-4"
        >
          <Input
            label={t('categories.categoryName')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
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

export default CategoriesPage;
