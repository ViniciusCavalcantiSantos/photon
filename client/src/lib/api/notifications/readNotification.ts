import apiFetch from "@/lib/apiFetch";
import type { ReadNotificationResponse } from "@/types/api-contracts";

export async function readNotification(id: string) {
  return await apiFetch<ReadNotificationResponse>(`/notifications/${id}/read`, {
    method: "POST"
  });
}
