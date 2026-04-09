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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { nowUTC } from '../../utils/dateUtils';

const schema = z.object({
  sku: z.string().catch(''),
  name: z.string().min(1, 'Requerido'),
  barcode: z.string().min(1, 'Requerido'),
  barcodeType: z.string().catch(''),
  description: z.string().catch(''),
  lotNumber: z.string().catch(''),
  qtyOnHand: z.coerce.number<number>().min(0).catch(0),
  expiryDate: z.string().catch(''),
  purchaseId: z.coerce.number<number>().catch(0),
  priceType: z.string().catch(''),
  price: z.coerce.number<number>().min(0).catch(0),
  brand: z.string().catch(''),
  categoryId: z.coerce.number<number>().catch(0),
  unitId: z.coerce.number<number>().catch(0),
  isSellable: z.boolean().catch(false),
  trackBatches: z.boolean().catch(false),
  taxProfileId: z.coerce.number<number>().catch(0),
  defaultCost: z.coerce.number<number>().catch(0),
  purchasePrice: z.coerce.number<number>().catch(0),
  wholesalePrice: z.coerce.number<number>().catch(0),
  salePrice: z.coerce.number<number>().min(0).catch(0),
  defaultPrice: z.coerce.number<number>().min(0).catch(0),
  createdAt: z.string().catch(nowUTC()),
  updatedAt: z.string().catch(''),
  deletedAt: z.string().catch(''),
});

type FormData = z.infer<typeof schema>;

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
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
      const payload: AddProductRequest = {
        id: 0,
        sku: d.sku || '',
        name: d.name,
        barcode: d.barcode || '',
        description: d.description || '',
        qtyOnHand: String(d.qtyOnHand ?? 0),
        price: String(d.price ?? 0),
        taxProfileId: d.taxProfileId ?? 0,
        purchasePrice: String(d.purchasePrice ?? 0),
        wholesalePrice: String(d.wholesalePrice ?? 0),
        salePrice: String(d.salePrice ?? 0),
        defaultPrice: String(d.defaultPrice ?? 0),
      };

      createMut.mutate(payload);
    }
  };

  const handleEdit = (p: Product) => {
    openEdit(p);
    setTimeout(() => {
      form.reset({
        sku: p.sku,
        name: p.name,
        barcode: p.barcode,
        barcodeType: p.barcodeType,
        description: p.description,
        lotNumber: p.lotNumber,
        qtyOnHand: p.qtyOnHand,
        expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '',
        purchaseId: p.purchaseId,
        priceType: p.priceType,
        price: p.price,
        brand: p.brand,
        categoryId: p.categoryId,
        unitId: p.unitId,
        isSellable: p.isSellable,
        trackBatches: p.trackBatches,
        taxProfileId: p.taxProfileId,
        defaultCost: p.defaultCost,
        purchasePrice: p.purchasePrice,
        wholesalePrice: p.wholesalePrice,
        salePrice: p.salePrice,
        defaultPrice: p.defaultPrice,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        deletedAt: p.deletedAt,
      });
    }, 10);
  };

  const handleDelete = async (p: Product) => {
    const res = await confirmDelete(p.name);
    if (res.isConfirmed) deleteMut.mutate(p.id);
  };

  const handleCreate = () => {
    form.reset({
      sku: '',
      name: '',
      barcode: '',
      barcodeType: '',
      description: '',
      lotNumber: '',
      qtyOnHand: 0,
      expiryDate: '',
      purchaseId: 0,
      priceType: '',
      price: 0,
      brand: '',
      categoryId: 0,
      unitId: 0,
      isSellable: false,
      trackBatches: false,
      taxProfileId: 0,
      defaultCost: 0,
      purchasePrice: 0,
      wholesalePrice: 0,
      salePrice: 0,
      defaultPrice: 0,
      createdAt: nowUTC(),
      updatedAt: '',
      deletedAt: '',
    });
    openCreate();
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('products.productName') },
    { accessorKey: 'barcode', header: t('products.barcode') },
    {
      accessorKey: 'price',
      header: t('products.sellingPrice'),
      cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
    },
    {
      accessorKey: 'qtyOnHand',
      header: t('products.currentStock'),
      cell: ({ getValue }) => `${Number(getValue()).toFixed(0)}`,
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
            setPage(1);
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
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label={t('products.sku')}
            {...form.register('sku')}
            error={form.formState.errors.sku?.message}
          />
          <Input
            label={t('products.barcode')}
            {...form.register('barcode')}
            error={form.formState.errors.barcode?.message}
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
            {...form.register('price')}
          />
          <Input
            label={t('products.currentStock')}
            type="number"
            {...form.register('qtyOnHand')}
          />
          <Input
            label={t('products.expirationDate')}
            type="date"
            {...form.register('expiryDate')}
          />
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
