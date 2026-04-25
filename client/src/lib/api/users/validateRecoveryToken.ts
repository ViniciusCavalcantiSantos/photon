import apiFetch from "@/lib/apiFetch";
import type { ValidateRecoveryTokenResponse } from "@/types/api-contracts";

export async function validateRecoveryToken(email: string, token: string) {
  return await apiFetch<ValidateRecoveryTokenResponse>("/auth/validate-recovery-token", {
    method: "POST",
    body: JSON.stringify({email, token}),
  });
}
