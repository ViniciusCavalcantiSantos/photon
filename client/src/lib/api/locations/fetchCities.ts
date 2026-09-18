import apiFetch from "@/lib/apiFetch";
import type { FetchCitiesResponse } from "@/types/api-contracts";

export async function fetchCities(country_cca2: string, state_code: string) {
  return await apiFetch<FetchCitiesResponse>(`/locations/countries/${country_cca2}/states/${state_code}/cities`, {
    method: "GET"
  });
}
