import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  CashJournal,
  CashEntry,
  CreateCashJournal,
  CashJournalUpdate,
} from '../models/cash.model';
import { getCurrentDate, nowUTC } from '../utils/dateUtils';

export const cashApi = {
  getJournals: (
    page = 1,
    limit = 10,
    total = 0,
    dateInit: string = getCurrentDate(),
    dateEnd: string = getCurrentDate(),
  ) =>
    api
      .get<ApiResponse<CashJournal[]>>('/cash_journal', {
        params: { page, limit, total, dateInit, dateEnd },
      })
      .then((r) => r.data),

  getJournalById: (id: number) =>
    api
      .get<ApiResponse<CashJournal>>(`/cash_journal/${id}`)
      .then((r) => r.data),

  openJournal: (payload: CreateCashJournal) =>
    api
      .post<ApiResponse<CashJournal>>('/cash_journal', { id: 0, ...payload })
      .then((r) => r.data),

  closeJournal: (id: number, payload: CashJournalUpdate) =>
    api
      .patch<ApiResponse<CashJournal>>(`/cash_journal/${id}`, payload)
      .then((r) => r.data),

  // Cash ledger entries (entradas/salidas) — flat /cash_entry endpoint.
  getEntries: (
    page = 1,
    limit = 20,
    total = 0,
    dateInit: string = getCurrentDate(),
    dateEnd: string = getCurrentDate(),
  ) =>
    api
      .get<ApiResponse<CashEntry[]>>('/cash_entry', {
        params: { page, limit, total, dateInit, dateEnd },
      })
      .then((r) => r.data),

  addEntry: (payload: {
    name: string;
    entryType: 'inflow' | 'outflow';
    amount: number;
    description?: string;
  }) =>
    api
      .post<ApiResponse<CashEntry>>('/cash_entry', {
        name: payload.name,
        entryType: payload.entryType,
        amount: payload.amount,
        description: payload.description ?? null,
        recordedAt: nowUTC(),
      })
      .then((r) => r.data),
};
