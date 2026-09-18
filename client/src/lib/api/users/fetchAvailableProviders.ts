import apiFetch from "@/lib/apiFetch";
import type { FetchAvailableProvidersResponse } from "@/types/api-contracts";

export async function fetchAvailableProviders() {
  return await apiFetch<FetchAvailableProvidersResponse>(`/auth/available-providers`, {
    method: "GET",
  });
}
