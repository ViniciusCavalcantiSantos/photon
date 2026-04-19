import apiFetch from "@/lib/apiFetch";
import type { SendRecoveryLinkResponse } from "@/types/api-contracts";

export async function sendRecoveryLink(email: string) {
  return await apiFetch<SendRecoveryLinkResponse>("/auth/send-recovery-link", {
    method: "POST",
    body: JSON.stringify({email}),
  });
}
