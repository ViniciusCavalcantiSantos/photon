import apiFetch from "@/lib/apiFetch";
import type { CreateEventResponse } from "@/types/api-contracts";

export async function createEvent(data: any) {
  return apiFetch<CreateEventResponse>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
