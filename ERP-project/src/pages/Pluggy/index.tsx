import { useState, useCallback } from "react";
import { ConectPluggy } from "../../service/pluggyService";
import { PluggyConnect } from "react-pluggy-connect";

const ConnectPluggy = () => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "open" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

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
      const msg =
        err instanceof Error ? err.message : "Erro ao iniciar conexão";
      setStatus("error");
      setMessage(msg);
    }
  }, []);

  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-12 text-center mt-5 mb-5">
          <h2>Conectar ao Pluggy</h2>
          <p>Bem-vindo! Aqui você iniciará o fluxo de conexão Pluggy.</p>
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
        <div className="col-12 text-center mt-4">
            <button className="btn-deletar">Sair</button>
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
            setMessage(`Conectado. itemId=${item.id}`);
          }}
          onError={({
            message: msg,
            data,
          }: {
            message: string;
            data?: { item?: { executionStatus?: string } };
          }) => {
            const st = data?.item?.executionStatus
              ? ` (${data.item.executionStatus})`
              : "";
            setStatus("error");
            setMessage(`Erro: ${msg}${st}`);
          }}
          onEvent={() => {}}
        />
      )}
    </div>
  );
};

export default ConnectPluggy;
