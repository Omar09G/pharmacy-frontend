export interface CashEntry {
  id: number;
  name: string;
  /** Canonical types: inflow | sale (money in) / outflow | expense (out). */
  entryType: 'inflow' | 'sale' | 'outflow' | 'expense';
  amount: number;
  methodId?: number | null;
  relatedType?: string | null;
  relatedId?: number | null;
  description?: string | null;
  recordedAt: string;
  recordedBy?: number | null;
}

export interface CashJournal {
  id: number;
  name: string;
  description?: string;
  openingAmount: number;
  openedAt: string;
  closedAt: string | null;
  openedBy: number;
  closedBy?: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
}

export interface CashJournalBalance {
  journalId: number;
  openingAmount: number;
  inflow: number;
  outflow: number;
  balance: number;
}
export interface CashJournalUpdate {
  id: number;
  closedAt: string | null;
  closedBy?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface CreateCashJournal {
  name: string;
  description?: string;
  openingAmount: number;
  openedAt: string;
  closedAt: string | null;
  openedBy: number;
  closedBy?: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
}
