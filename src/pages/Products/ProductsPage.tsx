import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { productApi } from '../../services/productApi';
import type { Product, AddProductRequest } from '../../models/product.model';
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
  productName: z.string().min(1, 'Requerido'),
  genericName: z.string().catch(''),
  barcode: z.string().min(1, 'Requerido'),
  presentation: z.string().catch(''),
  categoryId: z.coerce.number<number>().catch(1),
  supplierId: z.coerce.number<number>().catch(1),
  purchasePrice: z.coerce.number<number>().min(0),
  sellingPrice: z.coerce.number<number>().min(0),
  minStock: z.coerce.number<number>().min(0).catch(0),
  maxStock: z.coerce.number<number>().min(0).catch(100),
  currentStock: z.coerce.number<number>().min(0).catch(0),
  expirationDate: z.string().catch(''),
  requiresPrescription: z.boolean().catch(false),
  active: z.boolean().catch(true),
});

type FormData = z.infer<typeof schema>;

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Product>();

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () =>
      productApi.getAll(page, DEFAULT_PAGE_SIZE, 0, search || undefined),
  });

  const products = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: (d: AddProductRequest) => productApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      showSuccess(t('products.created'));
      close();
    },
    onError: () => showError(t('common.error')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Product> }) =>
      productApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      showSuccess(t('products.updated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      showSuccess(t('products.deleted'));
    },
    onError: () => showError(t('common.error')),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: d });
    } else {
      createMut.mutate({ id: 0, ...d } as AddProductRequest);
    }
  };

  const handleEdit = (p: Product) => {
    openEdit(p);
    setTimeout(() => {
      form.reset({
        productName: p.productName,
        genericName: p.genericName,
        barcode: p.barcode,
        presentation: p.presentation,
        categoryId: p.categoryId,
        supplierId: p.supplierId,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        minStock: p.minStock,
        maxStock: p.maxStock,
        currentStock: p.currentStock,
        expirationDate: p.expirationDate?.slice(0, 10) ?? '',
        requiresPrescription: p.requiresPrescription,
        active: p.active,
      });
    }, 10);
  };

  const handleDelete = async (p: Product) => {
    const res = await confirmDelete(p.productName);
    if (res.isConfirmed) deleteMut.mutate(p.id);
  };

  const handleCreate = () => {
    form.reset({
      productName: '',
      genericName: '',
      barcode: '',
      presentation: '',
      categoryId: 1,
      supplierId: 1,
      purchasePrice: 0,
      sellingPrice: 0,
      minStock: 0,
      maxStock: 100,
      currentStock: 0,
      expirationDate: '',
      requiresPrescription: false,
      active: true,
    });
    openCreate();
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'productName', header: t('products.productName') },
    { accessorKey: 'barcode', header: t('products.barcode') },
    {
      accessorKey: 'sellingPrice',
      header: t('products.sellingPrice'),
      cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
    },
    { accessorKey: 'currentStock', header: t('products.currentStock') },
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
          {t('products.title')}
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('products.newProduct')}
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
        <DataTable columns={columns} data={products} loading={isLoading} />
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
        title={editing ? t('products.editProduct') : t('products.newProduct')}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                form.reset();
              }}
            >
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
            label={t('products.productName')}
            {...form.register('productName')}
            error={form.formState.errors.productName?.message}
          />
          <Input
            label={t('products.genericName')}
            {...form.register('genericName')}
          />
          <Input
            label={t('products.barcode')}
            {...form.register('barcode')}
            error={form.formState.errors.barcode?.message}
          />
          <Input
            label={t('products.presentation')}
            {...form.register('presentation')}
          />
          <Input
            label={t('products.purchasePrice')}
            type="number"
            step="0.01"
            {...form.register('purchasePrice')}
          />
          <Input
            label={t('products.sellingPrice')}
            type="number"
            step="0.01"
            {...form.register('sellingPrice')}
          />
          <Input
            label={t('products.minStock')}
            type="number"
            {...form.register('minStock')}
          />
          <Input
            label={t('products.maxStock')}
            type="number"
            {...form.register('maxStock')}
          />
          <Input
            label={t('products.currentStock')}
            type="number"
            {...form.register('currentStock')}
          />
          <Input
            label={t('products.expirationDate')}
            type="date"
            {...form.register('expirationDate')}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              {...form.register('requiresPrescription')}
              className="rounded"
            />
            {t('products.requiresPrescription')}
          </label>
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

export default ProductsPage;
