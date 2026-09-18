import apiFetch from "@/lib/apiFetch";
import type { FetchClientsResponse } from "@/types/api-contracts";

export async function fetchClients(page: number = 1, pageSize: number = 15, searchTerm?: string) {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(pageSize)
  });

  if (searchTerm) {
    query.append('search', searchTerm);
  }

  return await apiFetch<FetchClientsResponse>(`/clients?${query.toString()}`, {
    method: "GET",
  });
}
