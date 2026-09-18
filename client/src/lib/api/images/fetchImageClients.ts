import apiFetch from "@/lib/apiFetch";
import type { FetchImageClientsResponse } from "@/types/api-contracts";

export async function fetchImageClients(imageId: string) {
  return await apiFetch<FetchImageClientsResponse>(`/images/${imageId}/clients`, {
    method: "GET",
  });
}
