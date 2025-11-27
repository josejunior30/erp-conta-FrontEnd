import { useContext, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { ContextToken } from "../../util/context-token";
import { isExpired } from "../../util/decodeJwtPayload";


export default function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { contextTokenPayload } = useContext(ContextToken);

  const authenticated = useMemo(
    () => !!contextTokenPayload && !isExpired(contextTokenPayload.exp),
    [contextTokenPayload]
  );

  if (authenticated) {
    return <Navigate to="/connect-pluggy" replace />;
  }

  return <>{children}</>;
}
