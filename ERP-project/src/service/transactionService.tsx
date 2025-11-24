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


export async function listItemTransactions(params: {
  itemId: string;
  from?: string;       
  to?: string;       
  status?: string;
  pageSize?: number;  
}): Promise<TransactionsResponse> {
  const { itemId, from, to, status, pageSize } = params;
  if (!itemId || itemId.trim().length === 0) {
    throw new Error("itemId é obrigatório");
  }

  const query: Record<string, string> = {};
  if (from && from.trim()) query.from = from.trim();
  if (to && to.trim()) query.to = to.trim();
  if (status && status.trim()) query.status = status.trim();
  if (typeof pageSize === "number") query.pageSize = String(pageSize);

  try {
    const { data } = await axios.get<TransactionsResponse>(
      `${BASE_URL}/api/pluggy/items/${encodeURIComponent(itemId)}/transactions`,
      { params: query }
    );
    return {
      itemId: String(data.itemId ?? itemId),
      count: Number(
        data.count ??
          (Array.isArray(data.transactions) ? data.transactions.length : 0)
      ),
      transactions: Array.isArray(data.transactions)
        ? data.transactions
        : [],
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const code = err.response?.status ?? "ERR";
      const body =
        typeof err.response?.data === "string"
          ? err.response.data
          : JSON.stringify(err.response?.data);
      throw new Error(`Falha ao listar transações (${code}): ${body}`);
    }
    throw err;
  }
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