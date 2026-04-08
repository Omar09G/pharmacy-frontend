import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type { CashJournal, CashEntry } from '../models/cash.model';

export const cashApi = {
  getJournals: (page = 0, limit = 10, total = 0) =>
    api
      .get<
        ApiResponse<CashJournal[]>
      >('/cash_journal', { params: { page, limit, total } })
      .then((r) => r.data),

  getJournalById: (id: number) =>
    api
      .get<ApiResponse<CashJournal>>(`/cash_journal/${id}`)
      .then((r) => r.data),

  openJournal: (payload: { openingAmount: number; notes: string }) =>
    api
      .put<ApiResponse<CashJournal>>('/cash_journal', { id: 0, ...payload })
      .then((r) => r.data),

  closeJournal: (
    id: number,
    payload: { closingAmount: number; notes: string },
  ) =>
    api
      .patch<ApiResponse<CashJournal>>(`/cash_journal/${id}/close`, payload)
      .then((r) => r.data),

  getEntries: (journalId: number, page = 0, limit = 20) =>
    api
      .get<
        ApiResponse<CashEntry[]>
      >(`/cash_journal/${journalId}/entries`, { params: { page, limit } })
      .then((r) => r.data),

  addEntry: (
    journalId: number,
    payload: {
      entryType: 'IN' | 'OUT';
      amount: number;
      description: string;
      reference: string;
    },
  ) =>
    api
      .put<
        ApiResponse<CashEntry>
      >(`/cash_journal/${journalId}/entries`, { id: 0, ...payload })
      .then((r) => r.data),
};
