import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { productApi } from '../../services/productApi';
import type {
  Product,
  ProductCreate,
  TaxProfileDetail,
  UnitDetail,
} from '../../models/product.model';
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
import { Plus, Trash2 } from 'lucide-react';
import { nowUTC } from '../../utils/dateUtils';
import Badge from '../../components/ui/Badge';
import { categoryApi } from '../../services/categoryApi';
import { Category } from '../../models/category.model';
import Select from '../../components/ui/Select';
import { purchaseApi } from '../../services/purchaseApi';
import { Purchase } from '../../models/purchase.model';

const schema = z.object({
  sku: z.string().catch(''),
  name: z.string().min(1, 'Requerido'),
  barcode: z.string().min(1, 'Requerido'),
  barcodeType: z.string().catch(''),
  description: z.string().catch(''),
  lotNumber: z.string().catch(''),
  qtyOnHand: z.coerce.number<number>().min(0).catch(0),
  purchaseId: z.coerce.number<number>().catch(0),
  priceType: z.string().catch(''),
  price: z.coerce.number<number>().min(0).catch(0),
  brand: z.string().catch(''),
  categoryId: z.coerce.number<number>().catch(0),
  unitId: z.coerce.number<number>().catch(0),
  taxProfileId: z.coerce.number<number>().catch(0),
  defaultCost: z.coerce.number<number>().catch(0),
  purchasePrice: z.coerce.number<number>().catch(0),
  wholesalePrice: z.coerce.number<number>().catch(0),
  defaultPrice: z.coerce.number<number>().min(0).catch(0),
});

type FormData = z.infer<typeof schema>;

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, close } = useCrudModal<Product>();

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () =>
      productApi.getAll(page, DEFAULT_PAGE_SIZE, 0, search || undefined),
  });

  const products = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(0, 100, 0),
  });

  const categoriesDetail: Category[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : [];

  const { data: unitData } = useQuery({
    queryKey: ['units'],
    queryFn: () => productApi.getAllUnits(0, 100, 0),
  });

  const unitsDetail: UnitDetail[] = Array.isArray(unitData?.data)
    ? unitData.data
    : [];

  const { data: taxData } = useQuery({
    queryKey: ['taxProfiles'],
    queryFn: () => productApi.getAllTaxProfiles(0, 100, 0),
  });

  const taxProfilesDetail: TaxProfileDetail[] = Array.isArray(taxData?.data)
    ? taxData.data
    : [];

  const { data: purchaseData } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => purchaseApi.getAll(0, 100, 0),
  });

  const purchasesDetail: Purchase[] = Array.isArray(purchaseData?.data)
    ? purchaseData.data
    : [];

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: (d: ProductCreate) => productApi.create(d),
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
      const payload: ProductCreate = {
        ...d,
        isSellable: false,
        trackBatches: false,
        createdAt: nowUTC(),
        updatedAt: nowUTC(),
        deletedAt: nowUTC(),
        salePrice: d.price,
        pricesDetail: {
          priceType: d.priceType,
          price: d.price,
          startsAt: nowUTC(),
          endsAt: nowUTC(),
          createdAt: nowUTC(),
        },
        lotsDetail: {
          lotNumber: d.lotNumber,
          qtyOnHand: d.qtyOnHand,
          expiryDate: nowUTC().split('T')[0], // This should be set based on form input if you want to track expiry
          purchaseId: d.purchaseId,
          createdAt: nowUTC(),
        },
        barcodesDetail: {
          barcode: d.barcode,
          barcodeType: d.barcodeType,
          createdAt: nowUTC(),
        },
      };
      createMut.mutate(payload);
    }
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
      purchaseId:
        purchasesDetail.length > 0
          ? purchasesDetail[purchasesDetail.length - 1].id
          : 0,
      priceType: '',
      price: 0,
      brand: '',
      categoryId: categoriesDetail.length > 0 ? categoriesDetail[0].id : 0,
      unitId: unitsDetail.length > 0 ? unitsDetail[0].id : 0,
      taxProfileId: taxProfilesDetail.length > 0 ? taxProfilesDetail[0].id : 0,
      defaultCost: 0,
      purchasePrice: 0,
      wholesalePrice: 0,
      defaultPrice: 0,
    });
    openCreate();
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('products.productName') },
    { accessorKey: 'barcodesDetail.barcode', header: t('products.barcode') },
    {
      accessorKey: 'pricesDetail.price',
      header: t('common.price'),
      cell: ({ getValue }) => {
        const reason = `$${Number(getValue()).toFixed(2)}` as string;
        return <Badge color="green">{reason}</Badge>;
      },
    },
    {
      accessorKey: 'salePrice',
      header: t('products.sellingPrice'),
      cell: ({ getValue }) => {
        const reason = `$${Number(getValue()).toFixed(2)}` as string;
        return <Badge color="blue">{reason}</Badge>;
      },
    },
    {
      accessorKey: 'lotsDetail.qtyOnHand',
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
        size="xl"
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
          className="grid grid-cols-5 md:grid-cols-2 gap-4"
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
          <Select
            label={t('products.category')}
            options={categoriesDetail.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
            {...form.register('categoryId')}
          />

          <Select
            label={t('config.units')}
            options={unitsDetail.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
            {...form.register('unitId')}
          />
          <Select
            label={t('config.units')}
            options={taxProfilesDetail.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
            {...form.register('taxProfileId')}
          />
          <Select
            label={t('purchases.invoiceNumber')}
            options={purchasesDetail.map((c) => ({
              label: `${c.invoiceNo}`,
              value: c.id,
            }))}
            {...form.register('purchaseId')}
          />
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
