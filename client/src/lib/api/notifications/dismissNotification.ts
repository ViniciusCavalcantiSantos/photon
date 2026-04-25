import apiFetch from "@/lib/apiFetch";
import type { DismissNotificationResponse } from "@/types/api-contracts";

export async function dismissNotification(id: string) {
  return await apiFetch<DismissNotificationResponse>(`/notifications/${id}/dismiss`, {
    method: "DELETE"
  });
}
