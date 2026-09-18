import apiFetch from "@/lib/apiFetch";
import type { SocialRedirectResponse } from "@/types/api-contracts";

export async function socialRedirect(socialMedia: string) {
  return await apiFetch<SocialRedirectResponse>(`/auth/${socialMedia}/redirect`, {
    method: "GET",
  });
}
