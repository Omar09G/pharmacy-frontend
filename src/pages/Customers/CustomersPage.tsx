import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
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
import {
  Plus,
  Pencil,
  Trash2,
  EyeIcon,
  BanIcon,
  SaveIcon,
  PencilIcon,
  ReceiptText,
} from 'lucide-react';
import { nowUTC } from '../../utils/dateUtils';

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido').or(z.literal('')).default(''),
  phone: z.string().default(''),
  billingAddress: z.string().default(''),
  documentId: z.string().default(''),
  creditLimit: z.coerce.number<number>().min(0, 'Mínimo 0').default(0),
  status: z.string().default('ACTIVE'),
  termsDays: z.coerce.number<number>().min(0, 'Mínimo 0').default(0),
});
type FormData = z.infer<typeof schema>;

const schemaCredit = z.object({
  customerId: z.coerce.number<number>().min(0).default(0),
  balance: z.coerce.number<number>().min(0).default(0),
  limitAmount: z.coerce.number<number>().min(0).default(0),
  lastOverdueDate: z.string().min(1, 'Requerido'),
});
type FormDataCredit = z.infer<typeof schemaCredit>;

const CustomersPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
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
    queryKey: ['customers', page, pageSize, search],
    queryFn: () => customerApi.getAll(page, pageSize, 0, search || undefined),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  const formCredit = useForm<FormDataCredit>({
    resolver: zodResolver(schemaCredit) as unknown as Resolver<FormDataCredit>,
  });

  const createMut = useMutation({
    mutationFn: (d: CustomerCreate) => customerApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.created'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: FormData }) =>
      customerApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.deleted'));
    },
    onError: (err) => showApiError(err),
  });

  const createMutCredit = useMutation({
    mutationFn: (d: CustomerCreditAccountCreate) =>
      customerApi.createCreditAccount(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.created'));
      closeCredit();
    },
    onError: (err) => showApiError(err),
  });
  const updateMutCredit = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: FormDataCredit }) =>
      customerApi.updateCreditAccount(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.updated'));
      closeCredit();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMutCredit = useMutation({
    mutationFn: (id: number) => customerApi.deleteCreditAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      showSuccess(t('customers.deleted'));
      closeCredit();
    },
    onError: (err) => showApiError(err),
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
      lastOverdueDate: nowUTC().split('T')[0],
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
          <Button
            title={t('tooltips.viewCreditLine')}
            variant="ghost"
            size="sm"
            onClick={() => handleViewLinCredit(row.original)}
          >
            <EyeIcon size={16} className="text-blue-500" />
          </Button>
          <Button
            title={t('tooltips.accountStatement')}
            variant="ghost"
            size="sm"
            onClick={() => handleViewLinCredit(row.original)}
          >
            <ReceiptText size={16} className="text-gray-500" />
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
        <Button title={t('tooltips.newCustomer')} onClick={handleCreate}>
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
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
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
            label={t('customers.fullName')}
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

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('common.status')}
            </label>
            <div className="relative">
              <select
                id="status"
                {...form.register('status')}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors duration-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:border-gray-500"
              >
                <option value="ACTIVE">{t('common.active')}</option>
                <option value="INACTIVE">{t('common.inactive')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={openCredit}
        onClose={closeCredit}
        title={t('customers.creditAccount')}
        footer={
          <>
            <Button
              title={t('tooltips.close')}
              onClick={closeCredit}
              variant="ghost"
              size="sm"
            >
              <BanIcon size={16} className="text-blue-500" />
            </Button>
            <Button
              title={t('tooltips.deleteCreditAccount')}
              onClick={() =>
                handleDeleteCredit(formCredit.getValues().customerId)
              }
              variant="ghost"
              size="sm"
            >
              <Trash2 size={16} className="text-red-500" />
            </Button>

            <Button
              title={t('tooltips.saveCreditAccount')}
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
