import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { supplierApi } from '../../services/supplierApi';
import type { Supplier, SupplierCreate } from '../../models/supplier.model';
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
  companyName: z.string().min(1, 'Requerido'),
  contactName: z.string().catch(''),
  email: z.string().email().or(z.literal('')).catch(''),
  phone: z.string().catch(''),
  address: z.string().catch(''),
  rfc: z.string().catch(''),
  active: z.boolean().catch(true),
});
type FormData = z.infer<typeof schema>;

const SuppliersPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Supplier>();
  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () =>
      supplierApi.getAll(page, DEFAULT_PAGE_SIZE, 0, search || undefined),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;
  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  const createMut = useMutation({
    mutationFn: (d: SupplierCreate) => supplierApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      showSuccess(t('suppliers.created'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: FormData }) =>
      supplierApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      showSuccess(t('suppliers.updated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => supplierApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      showSuccess(t('suppliers.deleted'));
    },
    onError: () => showError(t('common.error')),
  });
  const onSubmit = (d: FormData) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: d });
    } else {
      createMut.mutate({ id: 0, ...d } as SupplierCreate);
    }
  };
  const handleEdit = (item: Supplier) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          companyName: item.companyName,
          contactName: item.contactName,
          email: item.email,
          phone: item.phone,
          address: item.address,
          rfc: item.rfc,
          active: item.active,
        }),
      10,
    );
  };
  const handleDelete = async (item: Supplier) => {
    const r = await confirmDelete(item.companyName);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      rfc: '',
      active: true,
    });
    openCreate();
  };

  const columns: ColumnDef<Supplier>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'companyName', header: t('suppliers.companyName') },
    { accessorKey: 'contactName', header: t('suppliers.contactName') },
    { accessorKey: 'phone', header: t('suppliers.phone') },
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
          {t('suppliers.title')}
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('suppliers.newSupplier')}
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
          editing ? t('suppliers.editSupplier') : t('suppliers.newSupplier')
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
            label={t('suppliers.companyName')}
            {...form.register('companyName')}
            error={form.formState.errors.companyName?.message}
          />
          <Input
            label={t('suppliers.contactName')}
            {...form.register('contactName')}
          />
          <Input
            label={t('suppliers.email')}
            type="email"
            {...form.register('email')}
          />
          <Input label={t('suppliers.phone')} {...form.register('phone')} />
          <Input label={t('suppliers.address')} {...form.register('address')} />
          <Input label={t('suppliers.rfc')} {...form.register('rfc')} />
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

export default SuppliersPage;
