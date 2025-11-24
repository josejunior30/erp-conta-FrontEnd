// src/pages/Transacoes.tsx
import React, { useEffect, useState } from "react";
import type { ItemDetailsDto } from "../../models/ItemDetailsDto";
import { listAllPluggyItems } from "../../service/transactionService";


const Transacoes: React.FC = () => {
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
          <h5 className="mb-0">Itens Pluggy</h5>
          <small className="text-muted">
            {loading ? "Carregando..." : `${items.length} item(ns)`}
          </small>
        </div>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "Atualizando..." : "Recarregar"}
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

      {/* Skeletons */}
      {loading && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="col" key={`sk-${i}`}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="placeholder-glow mb-2">
                    <span className="placeholder col-8"></span>
                  </div>
                  <div className="placeholder-glow mb-2">
                    <span className="placeholder col-4 me-2"></span>
                    <span className="placeholder col-3"></span>
                  </div>
                  <div className="placeholder-glow mb-2">
                    <span className="placeholder col-12"></span>
                  </div>
                  <div className="placeholder-glow">
                    <span className="placeholder col-6"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
          {items.map((it) => {
            const conn = it.connector ?? ({} as ItemDetailsDto["connector"]);
            const color = conn?.primaryColor ?? "";
            const instUrl = conn?.institutionUrl ?? "";
            return (
              <div className="col" key={it.id ?? `${conn?.id}-${Math.random()}`}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="card-title mb-0">{conn?.name ?? "—"}</h6>
                      {color ? (
                        <span
                          title={color}
                          style={{
                            display: "inline-block",
                            width: 18,
                            height: 18,
                            borderRadius: 6,
                            background: color,
                            border: "1px solid rgba(0,0,0,.1)",
                          }}
                        />
                      ) : null}
                    </div>

                    <div className="mb-2">
                      <span className="badge text-bg-light me-2">
                        {conn?.type ?? "Tipo —"}
                      </span>
                      <span className="badge text-bg-secondary">
                        {conn?.country ?? "País —"}
                      </span>
                    </div>

                    <div className="small text-muted mb-2">
                      <div>
                        <span className="fw-semibold">Item ID:</span>{" "}
                        <code>{it.id ?? "—"}</code>
                      </div>
                      <div>
                        <span className="fw-semibold">Connector ID:</span>{" "}
                        <code>{conn?.id ?? "—"}</code>
                      </div>
                    </div>

                    <div className="mt-auto d-flex align-items-center justify-content-between">
                      {instUrl ? (
                        <a
                          className="btn btn-sm btn-outline-primary"
                          href={instUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Instituição
                        </a>
                      ) : (
                        <span className="text-muted small">Sem URL</span>
                      )}
                      <span className="text-muted small">
                        {color ? <code>{color}</code> : ""}
                      </span>
                    </div>
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

export default Transacoes;
