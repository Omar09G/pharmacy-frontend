import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { cashApi } from '../../services/cashApi';
import type {
  CashJournal,
  CashJournalUpdate,
  CreateCashJournal,
} from '../../models/cash.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { showSuccess, showError } from '../../utils/alerts';
import { useCrudModal } from '../../hooks/useCrudModal';
import { formatLocal, getCurrentDate, nowUTC } from '../../utils/dateUtils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import DateRangeInput from '../../components/ui/DateRangeInput';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { PencilIcon, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const openSchema = z.object({
  openingAmount: z.coerce.number<number>().min(0, 'Requerido'),
  name: z.string().min(1, 'Requerido'),
  description: z.string(),
  status: z.string().default('OPEN'),
});
type OpenFormData = z.infer<typeof openSchema>;

const CashJournalPage: React.FC = () => {
  const { user } = useAuthStore.getState();
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [dateInit, setDateInit] = useState(getCurrentDate());
  const [dateEnd, setDateEnd] = useState(getCurrentDate());
  const { open, openCreate, close } = useCrudModal<CashJournal>();

  const { data, isLoading } = useQuery({
    queryKey: ['cashJournals', page, dateInit, dateEnd],
    queryFn: () =>
      cashApi.getJournals(page, DEFAULT_PAGE_SIZE, 0, dateInit, dateEnd),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  const form = useForm({ resolver: zodResolver(openSchema) });

  const openMut = useMutation({
    mutationFn: (payload: CreateCashJournal) => cashApi.openJournal(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashJournals'] });
      showSuccess(t('cashJournal.journalOpened'));
      close();
    },
    onError: () => showError(t('common.error')),
  });

  const closeMut = useMutation({
    mutationFn: (payload: CashJournalUpdate) =>
      cashApi.closeJournal(payload.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashJournals'] });
      showSuccess(t('cashJournal.journalClosed'));
    },
    onError: () => showError(t('common.error')),
  });

  const onSubmitCancelJournal = (d: CashJournal) => {
    const payload: CashJournalUpdate = {
      id: d.id, // El ID se establecerá en el botón de cerrar
      closedAt: nowUTC(),
      closedBy: user?.id,
      status: 'CLOSED',
    };

    closeMut.mutate(payload);
  };

  const onSubmitJournal = (d: OpenFormData) => {
    const payload: CreateCashJournal = {
      name: d.name,
      description: d.description,
      openingAmount: d.openingAmount,
      openedAt: nowUTC(),
      closedAt: null,
      openedBy: user?.id ?? 0,
      status: 'OPEN',
      createdAt: nowUTC(),
    };

    openMut.mutate(payload);
  };

  const handleOpen = () => {
    form.reset({ openingAmount: 0, name: '', description: '', status: 'OPEN' });
    openCreate();
  };

  const columns: ColumnDef<CashJournal>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    {
      accessorKey: 'name',
      header: t('cashJournal.nameJournal'),
    },
    {
      accessorKey: 'openingAmount',
      header: t('cashJournal.openingAmount'),
      cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
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
            onClick={() => onSubmitCancelJournal(row.original)}
            loading={closeMut.isPending}
          >
            <PencilIcon size={16} className="text-red-500" />{' '}
            {t('common.confirm')}
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
        <DateRangeInput
          dateInit={dateInit}
          dateEnd={dateEnd}
          onDateInitChange={(v) => {
            setDateInit(v);
            setPage(1);
          }}
          onDateEndChange={(v) => {
            setDateEnd(v);
            setPage(1);
          }}
          labelInit={t('common.dateFrom')}
          labelEnd={t('common.dateTo')}
          className="mb-4"
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
              onClick={form.handleSubmit(onSubmitJournal)}
              loading={openMut.isPending}
            >
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <form
          onSubmit={form.handleSubmit(onSubmitJournal)}
          className="grid grid-cols-1 gap-4"
        >
          <Input
            label={t('cashJournal.nameJournal')}
            {...form.register('name')}
          />
          <Input
            label={t('cashJournal.descriptionJournal')}
            {...form.register('description')}
          />
          <Input
            label={t('cashJournal.openingAmount')}
            type="number"
            step="0.01"
            {...form.register('openingAmount')}
            error={form.formState.errors.openingAmount?.message}
          />
          <Input
            label={t('common.status')}
            {...form.register('status')}
            error={form.formState.errors.status?.message}
            disabled={true}
          />
        </form>
      </Modal>
    </div>
  );
};

export default CashJournalPage;
