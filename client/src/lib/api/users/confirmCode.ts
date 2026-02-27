import apiFetch from "@/lib/apiFetch";

export async function confirmCode(email: string, code: string) {
  const isTokenMode = process.env.NEXT_PUBLIC_AUTH_TYPE === 'token';
  return await apiFetch("/auth/confirm-code", {
    method: "POST",
    body: JSON.stringify({ email, code, ...(isTokenMode ? { type: 'token' } : {}) }),
  });
}