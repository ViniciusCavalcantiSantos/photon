import apiFetch from "@/lib/apiFetch";
import type { RemoveEventResponse } from "@/types/api-contracts";

export async function removeEvent(id: number) {
  return apiFetch<RemoveEventResponse>(`/events/${id}`, {
    method: "DELETE",
  });
}
