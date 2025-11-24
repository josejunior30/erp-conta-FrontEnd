import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEyeSlash, FaEye } from "react-icons/fa";
import { isAxiosError } from "axios";

import type { AccessTokenPayloadDTO } from "../../models/auth";
import "./styles.css";
import IgrejaLogin from "../../assets/igreja.png";
import { ContextToken } from "../../util/context-token";
import { signIn } from "../../service/api";

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401 || status === 403) return "Credenciais inválidas.";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = err.response?.data;
    return ((typeof data === "object" && (data?.error || data?.message)) || err.message || "Erro ao entrar.");
  }
  if (err instanceof Error) return err.message;
  return "Erro ao entrar.";
}

const Login = () => {
  const navigate = useNavigate();
  const { setContextTokenPayload } = useContext(ContextToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepConnected, setKeepConnected] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    try {
      setLoading(true);
      const payload: AccessTokenPayloadDTO = await signIn(email.trim(), password);
      setContextTokenPayload(payload);
     
      navigate("/connect-pluggy", { replace: true });
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="container-fluid ">
        <div className="row w-100 ">
          <div className="col-md-6 logo-templo text-end align-content-center">
            <img src={IgrejaLogin} className="img-igreja" />
          </div>

          <div className="col-md-6 d-flex flex-column mt-5 align-items-center container-login">
            <div className="w-100 section-login" style={{ maxWidth: "340px" }}>
              <h4 className="text-center ">Entre na sua Conta</h4>
              <p className="text-center">Seja Bem-Vindo!</p>

              <form className="mt-4" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="mb-1 input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Senha"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    id="olho"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="form-check mb-3 d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-check-input checkbox-conectado"
                    id="keepConnected"
                    checked={keepConnected}
                    onChange={(e) => setKeepConnected(e.target.checked)}
                  />
                  <label className="manter-conectado" htmlFor="keepConnected" style={{ margin: 0 }}>
                    Mantenha-me conectado
                  </label>
                </div>

                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}

                <button type="submit" className="button-primary w-100 btn-entrar-loogin" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
