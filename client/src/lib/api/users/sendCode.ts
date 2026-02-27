import apiFetch from "@/lib/apiFetch";

export async function sendCode(email: string) {
  const isTokenMode = process.env.NEXT_PUBLIC_AUTH_TYPE === 'token';
  return await apiFetch("/auth/send-code", {
    method: "POST",
    body: JSON.stringify({ email, ...(isTokenMode ? { type: 'token' } : {}) }),
  });
}
