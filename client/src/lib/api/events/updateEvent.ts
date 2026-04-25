import apiFetch from "@/lib/apiFetch";
import type { UpdateEventResponse } from "@/types/api-contracts";

export async function updateEvent(id: number, data: any) {
  return apiFetch<UpdateEventResponse>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
