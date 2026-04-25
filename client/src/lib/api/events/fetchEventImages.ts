import apiFetch from "@/lib/apiFetch";
import type { FetchEventImagesResponse } from "@/types/api-contracts";

export async function fetchEventImages(eventId: number) {
  return await apiFetch<FetchEventImagesResponse>(`/events/${eventId}/images`, {
    method: "GET",
  });
}
