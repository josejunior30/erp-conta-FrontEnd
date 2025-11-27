import type { Transaction } from "./Transaction";

export interface TransactionsResponse {
  itemId: string;
  from?: string;
  to?: string;
  totalCount: number;
  totalInflow: number;
  totalOutflow: number;
  net: number;
  currencyHint?: string;
  transactions: Transaction[];
}