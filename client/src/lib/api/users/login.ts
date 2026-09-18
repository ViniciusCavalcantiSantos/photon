import apiFetch from "@/lib/apiFetch";
import type { LoginResponse } from "@/types/api-contracts";

export async function login(email: string, password: string, remember_me: boolean) {
  let baseURL = undefined;
  let path = "/auth/login"
  if (process.env.NEXT_PUBLIC_AUTH_TYPE === 'token') {
    baseURL = process.env.NEXT_PUBLIC_APP_URL;
    path = "/api/auth/login"
  }

  return await apiFetch<LoginResponse>(path, {
    method: "POST",
    body: JSON.stringify({ email, password, remember_me }),
    baseURL: baseURL
  });
}
