import apiFetch from "@/lib/apiFetch";
import type { RemoveImageResponse } from "@/types/api-contracts";

export async function removeImage(imageId: string) {
  return await apiFetch<RemoveImageResponse>(`/images/${imageId}`, {
    method: "DELETE",
  });
}
