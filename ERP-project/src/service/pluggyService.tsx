import axios from "axios";
import { BASE_URL } from "../util/system";


export async function ConectPluggy(
  params: {
    clientUserId?: string;
    avoidDuplicates?: boolean;
    itemId?: string;
    oauthRedirectUri?: string;
  } = {}
): Promise<string> {
  const payload: Record<string, unknown> = {};
  if (params.clientUserId) payload.clientUserId = params.clientUserId;
  if (typeof params.avoidDuplicates === "boolean")
    payload.avoidDuplicates = params.avoidDuplicates;
  if (params.itemId) payload.itemId = params.itemId;
  if (params.oauthRedirectUri)
    payload.oauthRedirectUri = params.oauthRedirectUri;

  const { data } = await axios.post(
    `${BASE_URL}/api/pluggy/connect-token`,
    payload
  );
  const token = data?.connectToken;
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("connectToken ausente na resposta");
  }
  return token;
}

// eslint-disable-next-line react-refresh/only-export-components
export async function deleteAllPluggyItems(): Promise<number> {
  const resp = await axios.delete(`${BASE_URL}/api/pluggy/items`);
  if (resp.status === 204) return 0;
  return typeof resp.data?.deleted === "number" ? resp.data.deleted : 0;
}