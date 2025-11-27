
import React, { useEffect, useMemo, useState, useContext } from "react";
import type { ItemDetailsDto } from "../../models/ItemDetailsDto";
import { listAllPluggyItems } from "../../service/transactionService";
import { deleteAllPluggyItems } from "../../service/pluggyService";
import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "../../util/system";
import { ContextToken } from "../../util/context-token";
import "./styles.css";

const resolveTypeLabel = (t?: string | null): string => {
  if (!t) return "Tipo —";
  if (t === "PERSONAL_BANK") return "Banco Pessoal";
  if (t === "PERSONAL_BUSINESS") return "Banco Empresarial";
  return t;
};

const resolveAccountTypeLabel = (t?: string | null): string => {
  if (!t) return "Conta";
  switch ((t || "").toUpperCase()) {
    case "BANK":
      return "Conta Corrente";
    case "SAVINGS":
      return "Poupança";
    case "CREDIT":
      return "Cartão de Crédito";
    case "LOAN":
      return "Empréstimo";
    case "INVESTMENT":
      return "Investimentos";
    case "WALLET":
      return "Carteira";
    default:
      return t || "Conta";
  }
};

const toNum = (v: number | null | undefined): number =>
  typeof v === "number" && isFinite(v) ? v : 0;

const formatMoney = (currency: string | null | undefined, value: number): string => {
  const cur = (currency || "BRL").toUpperCase();
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  }
};

type AccountVM = NonNullable<ItemDetailsDto["accounts"]>[number];
type DeckGroup = {
  itemId: string | null;
  conn: ItemDetailsDto["connector"];
  accounts: AccountVM[];
};

const Banco: React.FC = () => {
  const [items, setItems] = useState<ItemDetailsDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [unsyncing, setUnsyncing] = useState(false);
  const [unsyncMsg, setUnsyncMsg] = useState<string | null>(null);
  const [unsyncError, setUnsyncError] = useState(false);

  const navigate = useNavigate();
  const { setContextTokenPayload } = useContext(ContextToken);

  function handleLogout() {
    // por quê: garante invalidação imediata da sessão e reavaliação dos guards
    clearToken();
    setContextTokenPayload(undefined);
    navigate("/", { replace: true });
  }

  function onLogoutKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLogout();
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllPluggyItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar itens");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleUnsync() {
    // por quê: evita remoção acidental e mantém UX informativa
    setUnsyncMsg(null);
    setUnsyncError(false);
    const ok = window.confirm(
      "Desincronizar vai remover todos os itens salvos localmente. Deseja continuar?"
    );
    if (!ok) return;
    try {
      setUnsyncing(true);
      const deleted = await deleteAllPluggyItems();
      await load();
      setUnsyncMsg(`Desincronizado com sucesso. ${deleted} item(ns) removido(s).`);
    } catch (e: unknown) {
      setUnsyncError(true);
      setUnsyncMsg(e instanceof Error ? e.message : "Falha ao desincronizar itens");
    } finally {
      setUnsyncing(false);
    }
  }

  const groups: DeckGroup[] = useMemo(() => {
    const map = new Map<string | null, DeckGroup>();
    for (const it of items) {
      const key = it.id ?? null;
      const accs = Array.isArray(it.accounts) ? it.accounts : [];
      if (!map.has(key)) {
        map.set(key, { itemId: key, conn: it.connector, accounts: [] });
      }
      map.get(key)!.accounts.push(...accs);
    }
    return Array.from(map.values()).filter((g) => g.accounts.length > 0);
  }, [items]);

  return (
    <div className="container-fluid ">
      <div className="row">
        <div
          className="col-12 d-flex align-items-center justify-content-between mt-4 mb-2"
          style={{ position: "sticky", top: 0, zIndex: 1050, background: "white", paddingTop: 8, paddingBottom: 8 }}
        >
          <h5 className="mb-0 w-100 text-center">
            <strong>Contas Conectadas</strong>
          </h5>
          <button
            type="button"
            className="btn btn-outline-danger ms-2"
            onClick={handleLogout}
            onKeyDown={onLogoutKeyDown}
            aria-label="Sair da conta"
            title="Sair"
          >
            Sair
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="alert alert-secondary" role="alert">
            Nenhum item encontrado.
          </div>
        )}

        {!loading && !error && items.length > 0 && groups.length === 0 && (
          <div className="alert alert-secondary" role="alert">
            Os itens não possuem contas disponíveis.
          </div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className="row ">
            {groups.map((g, gi) => {
              const conn = g.conn ?? ({} as ItemDetailsDto["connector"]);
              const instUrl = conn?.institutionUrl ?? "";

              return (
                <div className="col-12" key={`deck-${g.itemId ?? gi}`}>
                  <div
                    className="deck"
                    aria-label={`Baralho de contas do item ${g.itemId ?? ""}`}
                  >
                    {g.accounts.map((acc, idx) => {
                      const currency = (acc?.currencyCode || "BRL").toUpperCase();
                      const available = toNum(acc?.availableBalance ?? acc?.balance);
                      const ledger = toNum(acc?.balance);

                      const hasAccountId =
                        !!acc?.id && String(acc.id).trim().length > 0;
                      const href = hasAccountId ? `/transacoes/${acc.id}` : "#";

                      return (
                        <article
                          key={`${g.itemId ?? "noitem"}-${acc?.id ?? idx}`}
                          className="deck-card"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          style={{ ["--i" as any]: idx } as React.CSSProperties}
                        >
                          <Link
                            to={href}
                            className="deck-card-link"
                            aria-label={`Abrir transações da conta ${acc?.id ?? ""}`}
                            aria-disabled={!hasAccountId}
                            onClick={(e) => {
                              if (!hasAccountId) e.preventDefault();
                            }}
                          />
                          <div className="card h-100 shadow-sm ">
                            <div className="card-body d-flex flex-column card-conta">
                              <div className="d-flex align-items-center justify-content-between mb-2 ">
                                <div className="d-flex align-items-center gap-2 ">
                                  {instUrl ? (
                                    <img
                                      src={instUrl}
                                      alt={conn?.name ?? "logo"}
                                      style={{
                                        width: 68,
                                        height: 68,
                                        objectFit: "contain",
                                      }}
                                    />
                                  ) : null}
                                  <div className="d-flex flex-column">
                                    <strong className="mb-0">
                                      {acc?.name || "Conta"}
                                    </strong>
                                  </div>
                                </div>
                                <span className="badge text-bg-light">
                                  {resolveAccountTypeLabel(acc?.type as string)}
                                </span>
                              </div>

                              <div className="mb-2">
                                <div className="text-muted small">Saldo disponível</div>
                                <div className="fs-5 fw-semibold">
                                  {formatMoney(currency, available)}
                                </div>
                                {ledger !== available && ledger > 0 ? (
                                  <div className="text-muted small">
                                    Contábil: {formatMoney(currency, ledger)}
                                  </div>
                                ) : null}
                              </div>
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge text-bg-light">
                                    {resolveTypeLabel(conn?.type)}
                                  </span>
                                  <span className="badge text-bg-secondary">
                                    {conn?.country ?? "País —"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="col-12 text-center mt-4">
          <button
            type="button"
            className="btn btn-warning"
            onClick={handleUnsync}
            disabled={unsyncing || loading}
            aria-label="Desincronizar itens"
            title="Remover todos os itens salvos"
          >
            {unsyncing ? "Desincronizando..." : "Desincronizar"}
          </button>
          {unsyncMsg && (
            <div
              className={`alert mt-3 ${unsyncError ? "alert-danger" : "alert-success"}`}
              role="alert"
            >
              {unsyncMsg}
            </div>
          )}
        </div>

        {loading && (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banco;
