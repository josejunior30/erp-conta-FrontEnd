import axios from "axios";
import { BASE_URL, getToken, saveToken } from "../util/system";
import type { AccessTokenPayloadDTO } from "../models/auth";
import { decodeJwtPayload } from "../util/decodeJwtPayload";


type LoginResponse = { token: string };

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function signIn(email: string, password: string): Promise<AccessTokenPayloadDTO> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  const token = data.token;
  if (!token) throw new Error("Token ausente na resposta.");
  saveToken(token);
  const payload = decodeJwtPayload<AccessTokenPayloadDTO>(token);
  if (!payload) throw new Error("Falha ao decodificar token.");
  return payload;
}
