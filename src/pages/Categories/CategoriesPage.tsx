import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { categoryApi } from '../../services/categoryApi';
import type { Category, CategoryCreate } from '../../models/category.model';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Select from '../../components/ui/Select';

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  description: z.string().default(''),
  parentId: z.coerce.number<number>().optional(),
});
type FormData = z.infer<typeof schema>;

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Category>();

  const { data, isLoading } = useQuery({
    queryKey: ['categories', page, pageSize, search],
    queryFn: () => categoryApi.getAll(page, pageSize, 0, search || undefined),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  // Preload data
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(0, 100, 0),
  });

  const categoriesDetail: Category[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : [];

  const createMut = useMutation({
    mutationFn: (d: CategoryCreate) => categoryApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      showSuccess(t('categories.created'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Category> }) =>
      categoryApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      showSuccess(t('categories.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      showSuccess(t('categories.deleted'));
    },
    onError: (err) => showApiError(err),
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
          parentId: item.parentId,
        }),
      10,
    );
  };
  const handleDelete = async (item: Category) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({ name: '', description: '', parentId: undefined });
    openCreate();
  };

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('categories.categoryName') },
    { accessorKey: 'description', header: t('common.description') },
    {
      accessorKey: 'parentId',
      header: t('categories.parentCategory'),
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
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
            <Select
              options={categoriesDetail.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
              {...form.register('parentId')}
              className="rounded"
            />
            {t('categories.parentCategory')}
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
