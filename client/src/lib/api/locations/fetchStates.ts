import apiFetch from "@/lib/apiFetch";
import type { FetchStatesResponse } from "@/types/api-contracts";

export async function fetchStates(country_cca2: string) {
  return await apiFetch<FetchStatesResponse>(`/locations/countries/${country_cca2}/states`, {
    method: "GET"
  });
}
