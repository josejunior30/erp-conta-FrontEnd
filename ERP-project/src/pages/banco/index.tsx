
import React, { useEffect, useState } from "react";
import type { ItemDetailsDto } from "../../models/ItemDetailsDto";
import { listAllPluggyItems } from "../../service/transactionService";
import { Link } from "react-router-dom";
import "./styles.css";

const resolveTypeLabel = (t?: string | null): string => {
  if (!t) return "Tipo —"; 
  if (t === "PERSONAL_BANK") return "Banco Pessoal";
  if (t === "PERSONAL_BUSINESS") return "Banco Empressarial";
  return t;
};

const Banco: React.FC = () => {
  const [items, setItems] = useState<ItemDetailsDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">Contas Conectadas</h5>
          <small className="text-muted">
            {loading ? "Carregando..." : `${items.length} item(ns)`}
          </small>
        </div>
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

      {!loading && !error && items.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
          {items.map((it) => {
            const conn = it.connector ?? ({} as ItemDetailsDto["connector"]);
            const color = conn?.primaryColor ?? "";
            const instUrl = conn?.institutionUrl ?? "";
            const canOpen = Boolean(it.id && String(it.id).trim().length > 0);

            return (
              <div className="col" key={it.id ?? `${conn?.id}-${Math.random()}`}>
                <div className="card container-banco h-100 shadow-sm">
                  <div className="card-body corpo-banco d-flex flex-column">
                    <Link
                      to={canOpen ? `/transacoes/${it.id}` : "#"}
                      aria-disabled={!canOpen}
                      onClick={(e) => {
                        if (!canOpen) e.preventDefault();
                      }}
                      title={canOpen ? "Ver transações do item" : "Item sem ID"}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h4 className="card-title mb-0"><strong>{conn?.name ?? "—"}</strong></h4>
                        {color ? <span className="span-tile" /> : null}
                        <img className="foto-banco" src={instUrl} />
                      </div>

                      <div className="mb-2">
                        <span className="badge text-bg-light me-2">
                          {resolveTypeLabel(conn?.type)}
                        </span>
                        <span className="badge text-bg-secondary">
                          {conn?.country ?? "País —"}
                        </span>
                      </div>

                      <div className="small text-muted mb-3">
                        <div>
                          <span className="fw-semibold">Item ID:</span>{" "}
                          <code>{it.id ?? "—"}</code>
                        </div>
                        <div>
                          <span className="fw-semibold">Connector ID:</span>{" "}
                          <code>{conn?.id ?? "—"}</code>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Banco;
