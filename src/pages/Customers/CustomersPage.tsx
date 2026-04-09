import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { customerApi } from '../../services/customerApi';
import type {
  Customer,
  CustomerCreate,
  CustomerCreditAccount,
  CustomerCreditAccountCreate,
} from '../../models/customer.model';
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
import {
  Plus,
  Pencil,
  Trash2,
  EyeIcon,
  BanIcon,
  SaveIcon,
  PencilIcon,
} from 'lucide-react';
import { nowUTC } from '../../utils/dateUtils';

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido').or(z.literal('')).catch(''),
  phone: z.string().catch(''),
  billingAddress: z.string().catch(''),
  documentId: z.string().catch(''),
  creditLimit: z.coerce.number<number>().min(0).catch(0),
  status: z.string().catch('ACTIVE'),
  termsDays: z.coerce.number<number>().min(0).catch(0),
});
type FormData = z.infer<typeof schema>;

const schemaCredit = z.object({
  customerId: z.coerce.number<number>().min(0).catch(0),
  balance: z.coerce.number<number>().min(0).catch(0),
  limitAmount: z.coerce.number<number>().min(0).catch(0),
  lastOverdueDate: z.string().min(1, 'Requerido'),
});
type FormDataCredit = z.infer<typeof schemaCredit>;

const CustomersPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<Customer>();

  const {
    open: openCredit,
    editing: editingCredit,
    openCreate: openCreateCredit,
    openEdit: openEditCredit,
    close: closeCredit,
  } = useCrudModal<CustomerCreditAccount>();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () =>
      customerApi.getAll(page, DEFAULT_PAGE_SIZE, 0, search || undefined),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const formCredit = useForm<FormDataCredit>({
    resolver: zodResolver(schemaCredit),
  });

  const createMut = useMutation({
    mutationFn: (d: CustomerCreate) => customerApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.created'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: FormData }) =>
      customerApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.updated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.deleted'));
    },
    onError: () => showError(t('common.error')),
  });

  const createMutCredit = useMutation({
    mutationFn: (d: CustomerCreditAccountCreate) =>
      customerApi.createCreditAccount(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.created'));
      closeCredit();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMutCredit = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: FormDataCredit }) =>
      customerApi.updateCreditAccount(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.updated'));
      closeCredit();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMutCredit = useMutation({
    mutationFn: (id: number) => customerApi.deleteCreditAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.deleted'));
      closeCredit();
    },
    onError: () => showError(t('common.error')),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      const updateData = { createdAt: nowUTC(), ...d };

      updateMut.mutate({ id: editing.id, data: updateData });
    } else {
      createMut.mutate({ id: 0, createdAt: nowUTC(), ...d } as CustomerCreate);
    }
  };

  const onSubmitCredit = (d: FormDataCredit) => {
    if (editingCredit) {
      updateMutCredit.mutate({ id: editingCredit.id, data: d });
    } else {
      createMutCredit.mutate({ id: 0, ...d } as CustomerCreditAccountCreate);
    }
  };

  const handleEdit = (item: Customer) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          name: item.name,
          email: item.email,
          phone: item.phone,
          billingAddress: item.billingAddress,
          documentId: item.documentId,
          creditLimit: item.creditLimit,
          status: item.status,
          termsDays: item.termsDays,
        }),
      10,
    );
  };

  const handleViewLinCredit = (item: Customer) => {
    openCreateCredit();
    customerApi
      .getByIdCreditAccount(item.id)
      .then((res) => {
        handleEditCredit(res?.data);
      })
      .catch(() => {
        handleCreateCredit(item.id);
      });
  };

  const handleEditCredit = (item: CustomerCreditAccount) => {
    openEditCredit(item);
    setTimeout(
      () =>
        formCredit.reset({
          customerId: item.customerId,
          balance: item.balance,
          limitAmount: item.limitAmount,
          lastOverdueDate: item.lastOverdueDate,
        }),
      10,
    );
  };

  const handleCreateCredit = (customerId: number) => {
    formCredit.reset({
      customerId,
      balance: 0,
      limitAmount: 0,
      lastOverdueDate: new Date().toISOString().split('T')[0],
    });
    openCreateCredit();
  };

  const handleDeleteCredit = async (id: number) => {
    const r = await confirmDelete(`Credit Account of Customer ID ${id}`);
    if (r.isConfirmed) deleteMutCredit.mutate(id);
  };

  const handleDelete = async (item: Customer) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({
      name: '',
      email: '',
      phone: '',
      billingAddress: '',
      documentId: '',
      creditLimit: 0,
      status: 'ACTIVE',
      termsDays: 15,
    });
    openCreate();
  };

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('customers.name') },
    { accessorKey: 'email', header: t('customers.email') },
    { accessorKey: 'phone', header: t('customers.phone') },
    { accessorKey: 'billingAddress', header: t('customers.address') },
    { accessorKey: 'documentId', header: t('customers.rfc') },
    {
      accessorKey: 'creditLimit',
      header: t('customers.creditLimit'),
      cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge color={status === 'ACTIVE' ? 'green' : 'red'}>
            {status === 'ACTIVE' ? t('common.active') : t('common.inactive')}
          </Badge>
        );
      },
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewLinCredit(row.original)}
          >
            <EyeIcon size={16} className="text-blue-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('customers.title')}
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('customers.newCustomer')}
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
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>
      <Modal
        open={open}
        onClose={close}
        title={
          editing ? t('customers.editCustomer') : t('customers.newCustomer')
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
            label={t('customers.name')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label={t('customers.email')}
            type="email"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
          <Input label={t('customers.phone')} {...form.register('phone')} />
          <Input
            label={t('customers.address')}
            {...form.register('billingAddress')}
          />
          <Input label={t('customers.rfc')} {...form.register('documentId')} />
          <Input
            label={t('customers.creditLimit')}
            type="number"
            step="0.01"
            {...form.register('creditLimit')}
          />
          <Input
            label={t('customers.termsDays')}
            type="number"
            {...form.register('termsDays')}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              {...form.register('status')}
              className="rounded"
              checked={form.watch('status') === 'ACTIVE'}
              onChange={(e) =>
                form.setValue(
                  'status',
                  e.target.checked ? 'ACTIVE' : 'INACTIVE',
                )
              }
            />
            {t('common.active')}
          </label>
        </form>
      </Modal>

      <Modal
        open={openCredit}
        onClose={closeCredit}
        title={t('customers.creditAccount')}
        footer={
          <>
            <Button onClick={closeCredit} variant="ghost" size="sm">
              <BanIcon size={16} className="text-blue-500" />
            </Button>
            <Button
              onClick={() =>
                handleDeleteCredit(formCredit.getValues().customerId)
              }
              variant="ghost"
              size="sm"
            >
              <Trash2 size={16} className="text-red-500" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={formCredit.handleSubmit(onSubmitCredit)}
              loading={createMutCredit.isPending || updateMutCredit.isPending}
            >
              {editingCredit ? (
                <PencilIcon size={16} className="text-black-500" />
              ) : (
                <SaveIcon size={16} className="text-green-500" />
              )}
            </Button>
          </>
        }
      >
        <form
          onSubmit={formCredit.handleSubmit(onSubmitCredit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            label={t('CustomerCreditAccount.customerId')}
            {...formCredit.register('customerId')}
            error={formCredit.formState.errors.customerId?.message}
            disabled={true}
          />

          <Input
            type="number"
            label={t('CustomerCreditAccount.balance')}
            {...formCredit.register('balance')}
            error={formCredit.formState.errors.balance?.message}
          />
          <Input
            type="number"
            label={t('CustomerCreditAccount.limitAmount')}
            {...formCredit.register('limitAmount')}
            error={formCredit.formState.errors.limitAmount?.message}
          />
          <Input
            type="date"
            label={t('CustomerCreditAccount.lastOverdueDate')}
            {...formCredit.register('lastOverdueDate')}
            error={formCredit.formState.errors.lastOverdueDate?.message}
          />
        </form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
