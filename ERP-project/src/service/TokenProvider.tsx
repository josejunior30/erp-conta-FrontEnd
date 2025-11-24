import { useState, useEffect, useMemo } from "react";
import type { AccessTokenPayloadDTO } from "../models/auth";
import { ContextToken } from "../util/context-token";
import { decodeJwtPayload, isExpired } from "../util/decodeJwtPayload";
import { getToken, clearToken } from "../util/system";

type Props = { children: React.ReactNode };

export default function TokenProvider({ children }: Props) {
  const [contextTokenPayload, setContextTokenPayload] = useState<AccessTokenPayloadDTO | undefined>(undefined);

 
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const payload = decodeJwtPayload<AccessTokenPayloadDTO>(token);
    if (!payload || isExpired(payload.exp)) {
      clearToken();
      setContextTokenPayload(undefined);
    } else {
      setContextTokenPayload(payload);
    }
  }, []);

  const value = useMemo(
    () => ({ contextTokenPayload, setContextTokenPayload }),
    [contextTokenPayload]
  );

  return <ContextToken.Provider value={value}>{children}</ContextToken.Provider>;
}