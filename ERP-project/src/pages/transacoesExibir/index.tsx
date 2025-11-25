/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ItemDetailsDto } from "../../models/ItemDetailsDto";
import type { TransactionsResponse } from "../../models/TransactionsResponse";
import {
  getPluggyItem,
  listItemTransactions,
} from "../../service/transactionService";
import "./styles.css";
const DEFAULT_PAGE_SIZE = 500;

const TransacoesExibir: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ItemDetailsDto | null>(null);
  const [tx, setTx] = useState<TransactionsResponse | null>(null);
  const [loadingItem, setLoadingItem] = useState<boolean>(true);
  const [loadingTx, setLoadingTx] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const canQuery = useMemo(
    () => Boolean(itemId && itemId.trim().length > 0),
    [itemId]
  );

  async function loadItemDetails() {
    if (!canQuery) return;
    setLoadingItem(true);
    try {
      const data = await getPluggyItem(itemId!);
      setItem(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao obter item");
    } finally {
      setLoadingItem(false);
    }
  }

  async function loadTransactions() {
    if (!canQuery) return;
    setLoadingTx(true);
    try {
      const data = await listItemTransactions({
        itemId: itemId!,
        from: from.trim() || undefined,
        to: to.trim() || undefined,
        status: status.trim() || undefined,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      setTx(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao obter transações");
    } finally {
      setLoadingTx(false);
    }
  }

  useEffect(() => {
    void loadItemDetails();
    void loadTransactions();
  }, [itemId]);

  return (
    <div className="container-fluid ">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div>
          <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
        </div>
      </div>
      <div className="col-10 offset-2 d-flex gap-3 justify-content-center align-items-center ">
        <div className="col-12 col-sm-3">
          <label className="form-label">De</label>
          <input
            className="form-control"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="dd/MM/yyyy ou ISO"
          />
        </div>
        <div className="col-12 col-sm-3">
          <label className="form-label">Até</label>
          <input
            className="form-control"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="dd/MM/yyyy"
          />
        </div>
        <div className="col-10 col-sm-3 containeir-btn-filtro">
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setError(null);
              void loadTransactions();
            }}
            disabled={loadingTx}
          >
            {loadingTx ? "Filtrando..." : "Aplicar filtros"}
          </button>
        </div>
      </div>

      <div className="col-10 offset-1 d-flex justify-content-between align-items-center mb-2 mt-4">
        <h6 className="mb-0">Transações</h6>
        <small className="text-muted">
          {loadingTx ? "Carregando..." : `${tx?.count ?? 0} registro(s)`}
        </small>
      </div>

      {!loadingTx && !tx?.transactions?.length && (
        <div className="alert alert-secondary mb-0">
          Nenhuma transação encontrada.
        </div>
      )}

      {!loadingTx && tx?.transactions?.length ? (
        <div className="col-10 offset-1">
          <div className="table-responsive ">
            <table className="table table-striped ">
              <thead className="thead">
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tx.transactions.map((t) => (
                  <tr key={t.id ?? Math.random().toString(36)}>
                    <td>{t.date ?? "—"}</td>
                    <td>{t.description ?? "—"}</td>
                    <td>
                      {typeof t.amount === "number" ? t.amount.toFixed(2) : "—"}
                    </td>
                    <td>{t.status ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TransacoesExibir;
