/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { TransactionsResponse } from "../models/TransactionsResponse";
import { BASE_URL } from "../util/system";
import type { ItemDetailsDto } from "../models/ItemDetailsDto";

export async function getPluggyItem(itemId: string): Promise<ItemDetailsDto> {
  if (!itemId || itemId.trim().length === 0) {
    throw new Error("itemId é obrigatório");
  }
  try {
    const { data } = await axios.get<ItemDetailsDto>(
      `${BASE_URL}/api/pluggy/items/${encodeURIComponent(itemId)}`
    );
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const code = err.response?.status ?? "ERR";
      const body =
        typeof err.response?.data === "string"
          ? err.response.data
          : JSON.stringify(err.response?.data);
      throw new Error(`Falha ao obter item (${code}): ${body}`);
    }
    throw err;
  }
}

export async function listAccountTransactions(params: {
  accountId: string;
  from?: string;
  to?: string;
  status?: string;
  pageSize?: number;
}): Promise<TransactionsResponse> {
  const { accountId, from, to, status, pageSize } = params;
  if (!accountId?.trim()) throw new Error("accountId é obrigatório");

  const q: Record<string, string> = {};
  if (from?.trim()) q.from = from.trim();
  if (to?.trim()) q.to = to.trim();
  if (status?.trim()) q.status = status.trim();
  if (typeof pageSize === "number") q.pageSize = String(pageSize);

  const { data } = await axios.get(
    `${BASE_URL}/api/pluggy/accounts/${encodeURIComponent(accountId)}/transactions`,
    { params: q }
  );

  const d: any = data ?? {};
  const transactions = Array.isArray(d.transactions) ? d.transactions : [];
  const totalCount = Number(d.totalCount ?? d.count ?? transactions.length);

  const inflow =
    d.totalInflow ??
    transactions.reduce((s: number, t: any) => {
      const a = +t?.amount || 0;
      return a > 0 ? s + a : s;
    }, 0);

  const outflow =
    d.totalOutflow ??
    transactions.reduce((s: number, t: any) => {
      const a = +t?.amount || 0;
      return a < 0 ? s + -a : s;
    }, 0);

  const net = d.net ?? (Number(inflow) - Number(outflow));

  return {
    itemId: String(d.itemId ?? d.accountId ?? accountId), // mantém compat
    totalCount,
    totalInflow: Number(inflow),
    totalOutflow: Number(outflow),
    net: Number(net),
    transactions,
  };
}
export async function listAllPluggyItems(): Promise<ItemDetailsDto[]> {
  try {
    const { data } = await axios.get<ItemDetailsDto[]>(
      `${BASE_URL}/api/pluggy/items`
    );

    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const code = err.response?.status ?? "ERR";
      const body =
        typeof err.response?.data === "string"
          ? err.response.data
          : JSON.stringify(err.response?.data);
      throw new Error(`Falha ao listar itens (${code}): ${body}`);
    }
    throw err;
  }
}
