import apiFetch from "@/lib/apiFetch";
import type { RemoveClientResponse } from "@/types/api-contracts";

export async function removeClient(id: number) {
  return await apiFetch<RemoveClientResponse>(`/clients/${id}`, {
    method: "DELETE",
  });
}
