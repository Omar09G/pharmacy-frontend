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
  openingAmount: number;
  closingAmount: number;
  openedAt: string;
  closedAt: string | null;
  userId: number;
  userName?: string;
  status: 'OPEN' | 'CLOSED';
  notes: string;
}

export interface CashJournalBalance {
  journalId: number;
  openingAmount: number;
  inflow: number;
  outflow: number;
  balance: number;
}
