// src/pages/Pluggy/index.tsx
import { useState, useCallback, useContext, useEffect } from "react";
import { ConectPluggy } from "../../service/pluggyService";
import { listAllPluggyItems } from "../../service/transactionService";
import { PluggyConnect } from "react-pluggy-connect";
import { useNavigate } from "react-router-dom";
import Modal from "../../modal/Modal";
import { clearToken } from "../../util/system";
import { ContextToken } from "../../util/context-token";

type Status = "idle" | "loading" | "ready" | "open" | "success" | "error";

const ConnectPluggy = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [checkingConn, setCheckingConn] = useState<boolean>(true); // por quê: evita modal falso-positivo
  const [showModal, setShowModal] = useState<boolean>(false);

  const navigate = useNavigate();
  const { setContextTokenPayload } = useContext(ContextToken);

  // Verifica conexão existente ao montar
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await listAllPluggyItems();
        const connected =
          Array.isArray(items) &&
          items.some((it) => Array.isArray(it.accounts) && it.accounts.length > 0);
        if (mounted) setIsConnected(connected);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // mantemos silêncio aqui; UX melhor mostra modal só se realmente não conectado
      } finally {
        if (mounted) setCheckingConn(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpen = useCallback(async () => {
    try {
      setStatus("loading");
      const connectToken = await ConectPluggy({
        clientUserId: "user-123",
        avoidDuplicates: true,
      });
      setToken(connectToken);
      setStatus("ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao iniciar conexão";
      setStatus("error");
      setMessage(msg);
    }
  }, []);

  const handleGoToTransactions = useCallback(() => {
    if (checkingConn) return; // evita piscar modal durante verificação
    if (!isConnected) {
      setShowModal(true);
      return;
    }
    navigate("/transacoes");
  }, [isConnected, checkingConn, navigate]);

  const handleLogout = useCallback(() => {
    clearToken();
    setContextTokenPayload(undefined);
    setToken(null);
    setIsConnected(false);
    setShowModal(false);
    setStatus("idle");
    setMessage("");
    navigate("/", { replace: true });
  }, [navigate, setContextTokenPayload]);

  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-12 text-center mt-5 mb-5">
          <h2>Conectar ao Pluggy</h2>
          <p>Bem-vindo! Aqui você iniciará o fluxo de conexão Pluggy.</p>
          {checkingConn ? (
            <small>Verificando conexões...</small>
          ) : isConnected ? (
            <small>Você já possui contas conectadas.</small>
          ) : (
            <small>Nenhuma conexão encontrada.</small>
          )}
        </div>

        <div className="col-12 text-center ">
          <button
            onClick={handleOpen}
            disabled={status === "loading" || !!token}
            className="button-primary-blue"
          >
            {status === "loading" ? "Carregando..." : "Conectar minha conta"}
          </button>
          {message && <p style={{ marginTop: 8 }}>{message}</p>}
        </div>

        <div className="col-12 text-center ">
          <button
            onClick={handleGoToTransactions}
            className="button-primary-blue"
            disabled={checkingConn}
            aria-disabled={checkingConn}
            title={checkingConn ? "Verificando conexão..." : "Ir para contas"}
          >
            Contas
          </button>
        </div>

        <div className="col-12 text-center mt-4">
          <button className="btn-deletar" onClick={handleLogout} aria-label="Sair">
            Sair
          </button>
        </div>
      </div>

      {token && (
        <PluggyConnect
          connectToken={token}
          includeSandbox
          onOpen={() => {
            setStatus("open");
            setMessage("Widget aberto");
          }}
          onClose={() => {
            setStatus("idle");
            setMessage("Widget fechado");
            setToken(null);
          }}
          onSuccess={({ item }: { item: { id: string } }) => {
            setStatus("success");
            setIsConnected(true); // garante que o botão "Contas" não mostre modal
            setMessage(`Conectado. itemId=${item.id}`);
          }}
          onError={({
            message: msg,
            data,
          }: {
            message: string;
            data?: { item?: { executionStatus?: string } };
          }) => {
            const st = data?.item?.executionStatus ? ` (${data.item.executionStatus})` : "";
            setStatus("error");
            setMessage(`Erro: ${msg}${st}`);
          }}
          onEvent={() => {}}
        />
      )}

      <Modal
        open={showModal}
        title="Conexão necessária"
        onClose={() => setShowModal(false)}
        onPrimary={() => {
          setShowModal(false);
          handleOpen();
        }}
        primaryText="Conectar agora"
      >
        <p>Você precisa primeiro conectar sua conta ao Pluggy para acessar as suas transações.</p>
      </Modal>
    </div>
  );
};

export default ConnectPluggy;
