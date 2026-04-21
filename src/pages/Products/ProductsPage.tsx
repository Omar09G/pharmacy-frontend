import React, { useState } from 'react';
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
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
import { showSuccess, showApiError, confirmDelete } from '../../utils/alerts';
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
  sku: z.string().default(''),
  name: z.string().min(1, 'Requerido'),
  barcode: z.string().min(1, 'Requerido'),
  barcodeType: z.string().default(''),
  description: z.string().default(''),
  lotNumber: z.string().default(''),
  qtyOnHand: z.coerce.number<number>().min(0, 'Mínimo 0'),
  purchaseId: z.coerce.number<number>().default(0),
  priceType: z.string().default(''),
  price: z.coerce.number<number>().min(0, 'Mínimo 0'),
  brand: z.string().default(''),
  categoryId: z.coerce.number<number>().min(1, 'Seleccione categoría'),
  unitId: z.coerce.number<number>().min(1, 'Seleccione unidad'),
  taxProfileId: z.coerce.number<number>().default(0),
  defaultCost: z.coerce.number<number>().min(0, 'Mínimo 0'),
  purchasePrice: z.coerce.number<number>().min(0, 'Mínimo 0'),
  wholesalePrice: z.coerce.number<number>().min(0, 'Mínimo 0'),
  defaultPrice: z.coerce.number<number>().min(0, 'Mínimo 0'),
  expiryDate: z.string().min(1, 'Fecha de expiración requerida'),
});

type FormData = z.infer<typeof schema>;

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, close } = useCrudModal<Product>();

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, pageSize, search],
    queryFn: () => productApi.getAll(page, pageSize, 0, search || undefined),
  });

  const products = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  // Preload reference data in parallel
  const [
    { data: categoriesData },
    { data: unitData },
    { data: taxData },
    { data: purchaseData },
  ] = useQueries({
    queries: [
      {
        queryKey: ['categories'],
        queryFn: () => categoryApi.getAll(1, 100, 0),
      },
      {
        queryKey: ['units'],
        queryFn: () => productApi.getAllUnits(1, 100, 0),
      },
      {
        queryKey: ['taxProfiles'],
        queryFn: () => productApi.getAllTaxProfiles(1, 100, 0),
      },
      {
        queryKey: ['purchases'],
        queryFn: () => purchaseApi.getAll(1, 100, 0),
      },
    ],
  });

  const categoriesDetail: Category[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : [];

  const unitsDetail: UnitDetail[] = Array.isArray(unitData?.data)
    ? unitData.data
    : [];

  const taxProfilesDetail: TaxProfileDetail[] = Array.isArray(taxData?.data)
    ? taxData.data
    : [];

  const purchasesDetail: Purchase[] = Array.isArray(purchaseData?.data)
    ? purchaseData.data
    : [];

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  const createMut = useMutation({
    mutationFn: (d: ProductCreate) => productApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      showSuccess(t('products.created'));
      close();
    },
    onError: (err) => showApiError(err),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<Product> }) =>
      productApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      showSuccess(t('products.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      showSuccess(t('products.deleted'));
    },
    onError: (err) => showApiError(err),
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
          expiryDate: d.expiryDate,
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
      expiryDate: '',
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
          {t('products.title')}
        </h1>
        <Button title={t('tooltips.newProduct')} onClick={handleCreate}>
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
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
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
              title={t('tooltips.clear')}
              variant="secondary"
              onClick={() => {
                form.reset();
              }}
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
            label={t('products.expiryDate') || 'Fecha de expiración'}
            type="date"
            {...form.register('expiryDate')}
            error={form.formState.errors.expiryDate?.message}
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
