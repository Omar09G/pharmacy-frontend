export interface CashEntry {
  id: number;
  journalId: number;
  entryType: 'IN' | 'OUT';
  amount: number;
  description: string;
  reference: string;
  userId: number;
  userName?: string;
  createdAt: string;
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
