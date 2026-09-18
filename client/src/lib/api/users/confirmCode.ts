import apiFetch from "@/lib/apiFetch";
import type { ConfirmCodeResponse } from "@/types/api-contracts";

export async function confirmCode(email: string, code: string) {
  const isTokenMode = process.env.NEXT_PUBLIC_AUTH_TYPE === 'token';
  return await apiFetch<ConfirmCodeResponse>("/auth/confirm-code", {
    method: "POST",
    body: JSON.stringify({ email, code, ...(isTokenMode ? { type: 'token' } : {}) }),
  });
}
