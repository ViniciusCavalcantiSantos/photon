import apiFetch from "@/lib/apiFetch";
import type { RegisterResponse } from "@/types/api-contracts";

export async function register(name: string, email: string, password: string, password_confirmation: string) {
  const isTokenMode = process.env.NEXT_PUBLIC_AUTH_TYPE === 'token';
  const baseURL = isTokenMode ? process.env.NEXT_PUBLIC_APP_URL : undefined;
  const path = isTokenMode ? "/api/auth/register" : "/auth/register";

  return await apiFetch<RegisterResponse>(path, {
    method: "POST",
    body: JSON.stringify({ name, email, password, password_confirmation }),
    baseURL,
  });
}
