import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { cashApi } from '../../services/cashApi';
import { dashboardApi } from '../../services/dashboardApi';
import type {
  CashEntry,
  CashJournal,
  CashJournalUpdate,
  CreateCashJournal,
} from '../../models/cash.model';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { showSuccess, showApiError } from '../../utils/alerts';
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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [dateInit, setDateInit] = useState(getCurrentDate());
  const [dateEnd, setDateEnd] = useState(getCurrentDate());
  const { open, openCreate, close } = useCrudModal<CashJournal>();

  const { data, isLoading } = useQuery({
    queryKey: ['cashJournals', page, pageSize, dateInit, dateEnd],
    queryFn: () => cashApi.getJournals(page, pageSize, 0, dateInit, dateEnd),
  });
  const items = Array.isArray(data?.data) ? data.data : [];
  const total = data?.total ?? 0;

  // Balance per journal (opening + inflows - outflows) for the selected range.
  const { data: balancesRes } = useQuery({
    queryKey: ['cashJournalBalance', dateInit, dateEnd],
    queryFn: () => dashboardApi.getCashJournalBalance(1, 200, 0, dateInit, dateEnd),
  });
  const balanceById = new Map(
    (Array.isArray(balancesRes?.data) ? balancesRes.data : []).map((b) => [
      b.cashJournalId,
      b,
    ]),
  );

  // Cash ledger entries (entradas/salidas) for the selected range.
  const [entriesPage, setEntriesPage] = useState(1);
  const { data: entriesRes, isLoading: entriesLoading } = useQuery({
    queryKey: ['cashEntries', entriesPage, pageSize, dateInit, dateEnd],
    queryFn: () => cashApi.getEntries(entriesPage, pageSize, 0, dateInit, dateEnd),
  });
  const entries = Array.isArray(entriesRes?.data) ? entriesRes.data : [];
  const entriesTotal = entriesRes?.total ?? 0;

  const isInflow = (e: CashEntry) =>
    e.entryType === 'inflow' || e.entryType === 'sale';

  const entryColumns: ColumnDef<CashEntry>[] = [
    {
      accessorKey: 'recordedAt',
      header: t('common.date'),
      cell: ({ getValue }) => formatLocal(getValue() as string, i18n.language),
    },
    { accessorKey: 'name', header: t('cashJournal.concept') },
    {
      accessorKey: 'entryType',
      header: t('common.type'),
      cell: ({ getValue }) => {
        const v = getValue() as CashEntry['entryType'];
        return <Badge tone={isInflow({ entryType: v } as CashEntry) ? 'success' : 'danger'}>{v}</Badge>;
      },
    },
    {
      accessorKey: 'amount',
      header: t('common.amount'),
      cell: ({ row }) => (
        <span
          className={`font-mono tabular-nums font-medium ${
            isInflow(row.original) ? 'text-success' : 'text-danger'
          }`}
        >
          {isInflow(row.original) ? '+' : '−'}$
          {Number(row.original.amount ?? 0).toFixed(2)}
        </span>
      ),
    },
  ];

  const form = useForm({ resolver: zodResolver(openSchema) });

  const openMut = useMutation({
    mutationFn: (payload: CreateCashJournal) => cashApi.openJournal(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashJournals'] });
      showSuccess(t('cashJournal.journalOpened'));
      close();
    },
    onError: (err) => showApiError(err),
  });

  const closeMut = useMutation({
    mutationFn: (payload: CashJournalUpdate) =>
      cashApi.closeJournal(payload.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashJournals'] });
      showSuccess(t('cashJournal.journalClosed'));
    },
    onError: (err) => showApiError(err),
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
      id: 'inflow',
      header: 'Entradas',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums text-success">
          ${Number(balanceById.get(row.original.id)?.inflow ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      id: 'outflow',
      header: 'Salidas',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums text-danger">
          ${Number(balanceById.get(row.original.id)?.outflow ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      id: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span className="font-mono tabular-nums font-semibold text-brand">
          ${Number(balanceById.get(row.original.id)?.balance ?? row.original.openingAmount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge tone={s === 'OPEN' ? 'success' : 'neutral'}>{s}</Badge>;
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
            title={t('tooltips.closeJournal')}
            variant="ghost"
            size="sm"
            onClick={() => onSubmitCancelJournal(row.original)}
            loading={closeMut.isPending}
          >
            <PencilIcon size={16} className="text-danger" />{' '}
            {t('common.confirm')}
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {t('cashJournal.title')}
        </h1>
        <Button title={t('tooltips.openJournal')} onClick={handleOpen}>
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
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <Card title="Entradas y Salidas">
        <DataTable
          columns={entryColumns}
          data={entries}
          loading={entriesLoading}
        />
        <Pagination
          page={entriesPage}
          totalItems={entriesTotal}
          pageSize={pageSize}
          onPageChange={setEntriesPage}
        />
      </Card>

      <Modal
        open={open}
        onClose={close}
        title={t('cashJournal.openJournal')}
        footer={
          <>
            <Button
              title={t('tooltips.cancel')}
              variant="secondary"
              onClick={close}
            >
              {t('common.cancel')}
            </Button>
            <Button
              title={t('tooltips.confirm')}
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
