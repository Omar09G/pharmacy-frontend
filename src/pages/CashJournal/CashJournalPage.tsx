import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { cashApi } from '../../services/cashApi';
import type { CashJournal } from '../../models/cash.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { showSuccess, showError } from '../../utils/alerts';
import { useCrudModal } from '../../hooks/useCrudModal';
import { formatLocal } from '../../utils/dateUtils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Plus } from 'lucide-react';

const openSchema = z.object({
  openingAmount: z.coerce.number<number>().min(0, 'Requerido'),
  notes: z.string().catch(''),
});
type OpenFormData = z.infer<typeof openSchema>;

const CashJournalPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { open, openCreate, close } = useCrudModal<CashJournal>();

  const { data, isLoading } = useQuery({
    queryKey: ['cashJournals', page, search],
    queryFn: () => cashApi.getJournals(page, DEFAULT_PAGE_SIZE),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm<OpenFormData>({ resolver: zodResolver(openSchema) });

  const openMut = useMutation({
    mutationFn: (d: OpenFormData) =>
      cashApi.openJournal({
        openingAmount: d.openingAmount,
        notes: d.notes ?? '',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashJournals'] });
      showSuccess(t('cashJournal.journalOpened'));
      close();
    },
    onError: () => showError(t('common.error')),
  });

  const closeMut = useMutation({
    mutationFn: ({
      id,
      closingAmount,
    }: {
      id: number;
      closingAmount: number;
    }) => cashApi.closeJournal(id, { closingAmount, notes: '' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashJournals'] });
      showSuccess(t('cashJournal.journalClosed'));
    },
    onError: () => showError(t('common.error')),
  });

  const handleOpen = () => {
    form.reset({ openingAmount: 0, notes: '' });
    openCreate();
  };

  const columns: ColumnDef<CashJournal>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    {
      accessorKey: 'openingAmount',
      header: t('cashJournal.openingAmount'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
    },
    {
      accessorKey: 'closingAmount',
      header: t('cashJournal.closingAmount'),
      cell: ({ getValue }) => {
        const v = getValue();
        return v != null ? `$${Number(v).toFixed(2)}` : '—';
      },
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge color={s === 'OPEN' ? 'green' : 'gray'}>{s}</Badge>;
      },
    },
    {
      accessorKey: 'openedAt',
      header: t('cashJournal.openedAt'),
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return v ? formatLocal(v, i18n.language) : '—';
      },
    },
    {
      accessorKey: 'closedAt',
      header: t('cashJournal.closedAt'),
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        return v ? formatLocal(v, i18n.language) : '—';
      },
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) =>
        row.original.status === 'OPEN' ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              closeMut.mutate({ id: row.original.id, closingAmount: 0 })
            }
            loading={closeMut.isPending}
          >
            {t('common.close')}
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('cashJournal.title')}
        </h1>
        <Button onClick={handleOpen}>
          <Plus size={16} /> {t('cashJournal.openJournal')}
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
        title={t('cashJournal.openJournal')}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={form.handleSubmit((d) => openMut.mutate(d))}
              loading={openMut.isPending}
            >
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <form
          onSubmit={form.handleSubmit((d) => openMut.mutate(d))}
          className="grid grid-cols-1 gap-4"
        >
          <Input
            label={t('cashJournal.openingAmount')}
            type="number"
            step="0.01"
            {...form.register('openingAmount')}
            error={form.formState.errors.openingAmount?.message}
          />
          <Input label={t('cashJournal.notes')} {...form.register('notes')} />
        </form>
      </Modal>
    </div>
  );
};

export default CashJournalPage;
