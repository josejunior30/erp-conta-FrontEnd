import { useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ContextToken } from "../../util/context-token";
import { getToken, clearToken } from "../../util/system";
import { decodeJwtPayload, isExpired } from "../../util/decodeJwtPayload";
import type { AccessTokenPayloadDTO } from "../../models/auth";

export default function RequireAuth() {
  const { contextTokenPayload, setContextTokenPayload } =
    useContext(ContextToken);
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!contextTokenPayload) {
          const token = getToken();
          if (token) {
            const payload = decodeJwtPayload<AccessTokenPayloadDTO>(token);
            if (payload && !isExpired(payload.exp)) {
              setContextTokenPayload(payload);
            } else {
              clearToken();
            }
          }
        }
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [contextTokenPayload, setContextTokenPayload]);

  const authenticated = useMemo(
    () => !!contextTokenPayload && !isExpired(contextTokenPayload.exp),
    [contextTokenPayload]
  );

  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status" aria-label="Carregando" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
