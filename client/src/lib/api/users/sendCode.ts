import apiFetch from "@/lib/apiFetch";
import type { SendCodeResponse } from "@/types/api-contracts";

export async function sendCode(email: string) {
  const isTokenMode = process.env.NEXT_PUBLIC_AUTH_TYPE === 'token';
  return await apiFetch<SendCodeResponse>("/auth/send-code", {
    method: "POST",
    body: JSON.stringify({ email, ...(isTokenMode ? { type: 'token' } : {}) }),
  });
}
