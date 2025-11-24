import type { Transaction } from "./Transaction";

export interface TransactionsResponse {
  itemId: string;
  count: number;
  transactions: Transaction[];
}