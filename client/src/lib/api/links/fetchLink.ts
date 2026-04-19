import apiFetch from "@/lib/apiFetch";
import type { FetchClientLinkResponse } from "@/types/api-contracts";

export async function fetchLink(linkId: string) {
  return apiFetch<FetchClientLinkResponse>(`/clients/links/${linkId}`, {
    method: "GET"
  });
}
