/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { TransactionsResponse } from "../../models/TransactionsResponse";
import { listAccountTransactions } from "../../service/transactionService";
import "./styles.css";
import { formatDateInput } from "../../util/fomatação/formatDateInput";
import { getAmountClass } from "../../util/fomatação/getAmountClass";

const DEFAULT_PAGE_SIZE = 500;

const TransacoesExibir: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const [tx, setTx] = useState<TransactionsResponse | null>(null);
  const [loadingTx, setLoadingTx] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const canQuery = useMemo(
    () => Boolean(accountId && accountId.trim().length > 0),
    [accountId]
  );

  async function loadTransactions() {
    if (!canQuery) return;
    setLoadingTx(true);
    try {
      const data = await listAccountTransactions({
        accountId: accountId!,
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
    setError(null);
    void loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

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
        <div className="col-12 col-sm-2">
          <label className="form-label">De</label>
          <input
            className="form-control"
            value={from}
            onChange={(e) => setFrom(formatDateInput(e.target.value))}
            inputMode="numeric"
            maxLength={10}
            placeholder="DD/MM/AAAA"
          />
        </div>
        <div className="col-12 col-sm-2">
          <label className="form-label">Até</label>
          <input
            className="form-control"
            value={to}
            onChange={(e) => setTo(formatDateInput(e.target.value))}
            placeholder="DD/MM/AAAA"
          />
        </div>
        <div className="col-10 col-sm-3 containeir-btn-filtro">
          <button
            className="btn btn-outline-primary"
            onClick={() => { setError(null); void loadTransactions(); }}
            disabled={loadingTx}
          >
            {loadingTx ? "Filtrando..." : "Aplicar filtros"}
          </button>
        </div>
      </div>

      <div className="col-10 offset-1 d-flex justify-content-between align-items-center mb-2 mt-4">
        <h6 className="mb-0">Transações</h6>
        <small className="text-muted">
          {loadingTx ? "Carregando..." : `${tx?.totalCount ?? 0} registro(s)`}
        </small>
      </div>

      {!loadingTx && !tx?.transactions?.length && (
        <div className="alert alert-secondary mb-0">Nenhuma transação encontrada.</div>
      )}

      {!loadingTx && tx?.transactions?.length ? (
        <div className="col-10 offset-1">
          <div className="table-responsive ">
            <table className="table table-striped ">
              <thead className="thead">
                <tr>
                  <th>Data / Horário</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tx.transactions.map((t) => (
                  <tr key={t.id ?? Math.random().toString(36)}>
                    <td>{t.dateTime ?? "—"}</td>
                    <td>{t.description ?? "—"}</td>
                    <td>
                      {typeof t.amount === "number" ? (
                        <span className={getAmountClass(t)}>{t.amountFormatted}</span>
                      ) : (
                        "—"
                      )}
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