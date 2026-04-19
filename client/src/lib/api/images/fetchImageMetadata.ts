import apiFetch from "@/lib/apiFetch";
import type { FetchImageMetadataResponse } from "@/types/api-contracts";

export async function fetchImageMetadata(imageId: string) {
  return await apiFetch<FetchImageMetadataResponse>(`/images/${imageId}/metadata`, {
    method: "GET",
  });
}
