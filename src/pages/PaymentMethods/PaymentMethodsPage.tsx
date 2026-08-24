import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { paymentMethodApi } from '../../services/paymentMethodApi';
import type {
  PaymentMethod,
  PaymentMethodCreate,
} from '../../models/payment-method.model';
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

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  methodType: z.string().min(1, 'Requerido'),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const PaymentMethodsPage: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } =
    useCrudModal<PaymentMethod>();

  const { data, isLoading } = useQuery({
    queryKey: ['paymentMethods', page, pageSize, search],
    queryFn: () => paymentMethodApi.getAll(page, pageSize),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  });

  const createMut = useMutation({
    mutationFn: (d: PaymentMethodCreate) => paymentMethodApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentMethods'] });
      showSuccess(t('paymentMethods.created'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const updateMut = useMutation({
    mutationFn: ({
      id,
      data: d,
    }: {
      id: number;
      data: Partial<PaymentMethod>;
    }) => paymentMethodApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentMethods'] });
      showSuccess(t('paymentMethods.updated'));
      close();
    },
    onError: (err) => showApiError(err),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => paymentMethodApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paymentMethods'] });
      showSuccess(t('paymentMethods.deleted'));
    },
    onError: (err) => showApiError(err),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: d });
    } else {
      createMut.mutate({ id: 0, ...d } as PaymentMethodCreate);
    }
  };

  const handleEdit = (item: PaymentMethod) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          name: item.name,
          methodType: item.methodType,
          active: item.active,
        }),
      10,
    );
  };
  const handleDelete = async (item: PaymentMethod) => {
    const r = await confirmDelete(item.name);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({ name: '', methodType: '', active: true });
    openCreate();
  };

  const columns: ColumnDef<PaymentMethod>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: t('paymentMethods.methodName') },
    { accessorKey: 'methodType', header: t('common.type') },
    {
      accessorKey: 'active',
      header: t('common.status'),
      cell: ({ getValue }) => (
        <Badge tone={getValue() ? 'success' : 'danger'}>
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
          {t('paymentMethods.title')}
        </h1>
        <Button title={t('tooltips.newPaymentMethod')} onClick={handleCreate}>
          <Plus size={16} /> {t('paymentMethods.newPaymentMethod')}
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
          editing
            ? t('paymentMethods.editPaymentMethod')
            : t('paymentMethods.newPaymentMethod')
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
          className="grid grid-cols-1 gap-4"
        >
          <Input
            label={t('paymentMethods.methodName')}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input label={t('common.type')} {...form.register('methodType')} />
          <label className="flex items-center gap-2 text-sm text-ink">
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

export default PaymentMethodsPage;
