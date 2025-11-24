export function decodeJwtPayload<T = unknown>(token: string): T | undefined {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(((payload.length + 3) >> 2) * 4, "="));
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

export function isExpired(exp: number | undefined): boolean {
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
}
