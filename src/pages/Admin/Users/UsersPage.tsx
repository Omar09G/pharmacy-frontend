import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { userApi } from '../../../services/userApi';
import type { User, UserCreate, UserUpdate } from '../../../models/user.model';
import { DEFAULT_PAGE_SIZE } from '../../../utils/constants';
import { showSuccess, showError, confirmDelete } from '../../../utils/alerts';
import { useCrudModal } from '../../../hooks/useCrudModal';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { roleApi } from '../../../services/roleApi';
import { useAuthStore } from '../../../store/authStore';

const schema = z.object({
  fullName: z.string().min(1, 'Requerido'),
  username: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido').or(z.literal('')).catch(''),
  phone: z.string().catch(''),
  password: z.string().catch(''),
  role: z.string().catch('USER'),
  status: z.string().min(1, 'Requerido').catch(''),
});
type FormData = z.infer<typeof schema>;

const UsersPage: React.FC = () => {
  //Obtener ID de usuario actual para createdBy y updatedBy
  const { user } = useAuthStore.getState();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { open, editing, openCreate, openEdit, close } = useCrudModal<User>();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () =>
      userApi.getAll(page, DEFAULT_PAGE_SIZE, 0, search || undefined),
  });

  const { data: roleData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.getAll(0, 100, 0),
  });

  const roleOptions =
    roleData?.data.map((r) => ({
      value: r.name,
      label: r.description || r.name,
    })) || [];

  const items = Array.isArray(data?.data) ? data.data : [];

  const total = data?.total ?? 0;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMut = useMutation({
    mutationFn: (d: UserCreate) => userApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      showSuccess(t('users.created'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: UserUpdate }) =>
      userApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      showSuccess(t('users.updated'));
      close();
    },
    onError: () => showError(t('common.error')),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      showSuccess(t('users.deleted'));
    },
    onError: () => showError(t('common.error')),
  });

  const onSubmit = (d: FormData) => {
    if (editing) {
      const { password: _pw, ...updatePayload } = d;
      const updatePay = updatePayload as UserUpdate;

      const updateData: UserUpdate = {
        ...updatePay,
        status: updatePay.status,
        updatedBy: user?.id || 1,
      };
      updateMut.mutate({ id: editing.id, data: updateData });
    } else {
      createMut.mutate({
        id: 0,
        ...d,
        createdAt: new Date().toISOString(),
      } as UserCreate);
    }
  };

  const handleEdit = (item: User) => {
    openEdit(item);
    setTimeout(
      () =>
        form.reset({
          fullName: item.fullName,
          username: item.username,
          email: item.email,
          phone: item.phone,
          password: '',
          role: item.role,
          status: item.status,
        }),
      10,
    );
  };
  const handleDelete = async (item: User) => {
    const r = await confirmDelete(item.fullName);
    if (r.isConfirmed) deleteMut.mutate(item.id);
  };
  const handleCreate = () => {
    form.reset({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: roleOptions.length > 0 ? roleOptions[0].value : 'USER',
      status: 'ACTIVE',
    });
    openCreate();
  };

  const columns: ColumnDef<User>[] = [
    // { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'fullName', header: t('users.fullName') },
    { accessorKey: 'username', header: t('users.username') },
    { accessorKey: 'email', header: t('users.email') },
    {
      accessorKey: 'role',
      header: t('users.role'),
      cell: ({ getValue }) => (
        <Badge color="blue">{getValue() as string}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const isActive = status === 'ACTIVE';
        return (
          <Badge color={isActive ? 'green' : 'red'}>
            {isActive ? t('common.active') : t('common.inactive')}
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('users.title')}
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} /> {t('users.newUser')}
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
        title={editing ? t('users.editUser') : t('users.newUser')}
        size="lg"
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
            label={t('users.fullName')}
            {...form.register('fullName')}
            error={form.formState.errors.fullName?.message}
          />
          <Input
            label={t('users.username')}
            {...form.register('username')}
            error={form.formState.errors.username?.message}
          />
          <Input
            label={t('users.email')}
            type="email"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
          <Input label={t('users.phone')} {...form.register('phone')} />
          {!editing && (
            <Input
              label={t('users.password')}
              type="password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />
          )}
          <Select
            label={t('users.role')}
            options={roleOptions}
            {...form.register('role')}
          />

          <Select
            {...form.register('status')}
            label={t('common.active')}
            options={[
              { value: 'ACTIVE', label: t('common.active') },
              { value: 'INACTIVE', label: t('common.inactive') },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
