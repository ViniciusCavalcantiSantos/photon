import apiFetch from "@/lib/apiFetch";
import type { ChangePasswordResponse } from "@/types/api-contracts";

export async function changePassword(email: string, token: string, password: string, password_confirmation: string) {
  return await apiFetch<ChangePasswordResponse>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({email, token, password, password_confirmation}),
  });
}
