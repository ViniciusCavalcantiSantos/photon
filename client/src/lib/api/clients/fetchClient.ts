import apiFetch from "@/lib/apiFetch";
import type { FetchClientResponse } from "@/types/api-contracts";

export async function fetchClient(id: number) {
  return await apiFetch<FetchClientResponse>(`/clients/${id}`, {
    method: "GET",
  });
}
