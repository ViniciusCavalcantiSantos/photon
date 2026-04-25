import apiFetch from "@/lib/apiFetch";
import type { FetchNotificationsResponse } from "@/types/api-contracts";

export async function fetchNotifications() {
  return await apiFetch<FetchNotificationsResponse>(`/notifications`, {
    method: "GET"
  });
}
