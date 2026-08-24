import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { supplierApi } from '../../services/supplierApi';
import type { Supplier, SupplierCreate } from '../../models/supplier.model';
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
import Badge from '../../components/ui/Badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { nowUTC } from '../../utils/dateUtils';

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  contactPerson: z.string().default(''),
  email: z.string().email().or(z.literal('')).default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  taxId: z.string().default(''),
  notes: z.string().default(''),
});
type FormData = z.infer<typeof schema>;

const SuppliersPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Supplier>();
  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, pageSize, search],
    queryFn: () => supplierApi.getAll(page, pageSize, 0, search || undefined),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;
  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });
  const createMut = useMutation({
    mutationFn: (d: SupplierCreate) => supplierApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      showSuccess(t('suppliers.created'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: FormData }) =>
      supplierApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      showSuccess(t('suppliers.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => supplierApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      showSuccess(t('suppliers.deleted'));
    },
    onError: (err) => showApiError(err),
  });
  const onSubmit = (d: FormData) => {
    if (editing) {
      const updateData = {
        name: d.name,
        contactPerson: d.contactPerson,
        email: d.email,
        phone: d.phone,
        address: d.address,
        taxId: d.taxId,
        notes: d.notes,
        createdAt: nowUTC(),
      };
      updateMut.mutate({ id: editing.id, data: updateData });
    } else {
      createMut.mutate({
        id: 0,
        createdAt: nowUTC(),
        ...d,
      } as SupplierCreate);
    }
  };
  const handleEdit = (item: Supplier) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          name: item.name,
          contactPerson: item.contactPerson,
          email: item.email,
          phone: item.phone,
          address: item.address,
          taxId: item.taxId,
          notes: item.notes,
        }),
      10,
    );
  };
  const handleDelete = async (item: Supplier) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      notes: '',
    });
    openCreate();
  };

  const columns: ColumnDef<Supplier>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('suppliers.name') },
    { accessorKey: 'contactPerson', header: t('suppliers.contactPerson') },
    { accessorKey: 'phone', header: t('suppliers.phone') },
    {
      accessorKey: 'taxId',
      header: t('suppliers.taxId'),
      cell: ({ getValue }) => (
        <Badge tone={getValue() ? 'success' : 'danger'}>
          {getValue() as string}
        </Badge>
      ),
    },
    { accessorKey: 'notes', header: t('suppliers.notes') },
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
          {t('suppliers.title')}
        </h1>
        <Button title={t('tooltips.newSupplier')} onClick={handleCreate}>
          <Plus size={16} /> {t('suppliers.newSupplier')}
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
          editing ? t('suppliers.editSupplier') : t('suppliers.newSupplier')
        }
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
            label={t('suppliers.name')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label={t('suppliers.contactPerson')}
            {...form.register('contactPerson')}
          />
          <Input
            label={t('suppliers.email')}
            type="email"
            {...form.register('email')}
          />
          <Input label={t('suppliers.phone')} {...form.register('phone')} />
          <Input label={t('suppliers.address')} {...form.register('address')} />
          <Input label={t('suppliers.taxId')} {...form.register('taxId')} />
          <Input label={t('suppliers.notes')} {...form.register('notes')} />
        </form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
