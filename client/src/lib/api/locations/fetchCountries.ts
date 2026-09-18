import apiFetch from "@/lib/apiFetch";
import type { FetchCountriesResponse } from "@/types/api-contracts";

export async function fetchCountries() {
  return await apiFetch<FetchCountriesResponse>("/locations/countries", {
    method: "GET",
  });
}
