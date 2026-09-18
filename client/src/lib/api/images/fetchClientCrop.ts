import apiFetch from "@/lib/apiFetch";
import type { FetchClientCropResponse } from "@/types/api-contracts";

export async function fetchClientCrop(imageId: string, clientId: number) {
  return await apiFetch<FetchClientCropResponse>(`/images/${imageId}/clients/${clientId}/crop`, {
    method: "GET",
  });
}
