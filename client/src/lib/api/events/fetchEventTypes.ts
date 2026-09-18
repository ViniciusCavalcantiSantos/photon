import apiFetch from "@/lib/apiFetch";
import type { FetchEventTypesResponse } from "@/types/api-contracts";

export async function fetchEventTypes(contractId: number) {
  return await apiFetch<FetchEventTypesResponse>(`/events/types/${contractId}`, {
    method: "GET",
  });
}
