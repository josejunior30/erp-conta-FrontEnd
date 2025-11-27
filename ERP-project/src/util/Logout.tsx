import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ContextToken } from "./context-token";
import { clearToken } from "./system";

export default function Logout() {
  const { setContextTokenPayload } = useContext(ContextToken);
  const navigate = useNavigate();

  useEffect(() => {
    // por quê: garante invalidação da sessão antes de trocar de rota
    clearToken();
    setContextTokenPayload(undefined);
    navigate("/", { replace: true });
  }, [navigate, setContextTokenPayload]);

  return null;
}