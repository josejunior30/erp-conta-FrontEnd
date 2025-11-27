export interface Transaction {
  id?: string;
  dateTime?: string;
  description?: string;
  merchantName?: string;
  category?: string;
  type: TransactionType;
  amount: number;
  amountFormatted: string;
  currency?: string;
  status?: string;
  account?: AccountLite;
}

export type TransactionType = 'inflow' | 'outflow';

export interface AccountLite {
  id: string;
  name?: string;
  type?: string;
  last4?: string;
}