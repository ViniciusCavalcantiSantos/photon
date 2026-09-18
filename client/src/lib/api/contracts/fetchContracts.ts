import apiFetch from "@/lib/apiFetch";
import {buildUrl} from "@/lib/http/buildUrl";
import type { FetchContractsResponse } from "@/types/api-contracts";

export async function fetchContracts(page: number = 1, pageSize: number = 15, searchTerm?: string) {
  const url = buildUrl('/contracts', {
    page: String(page),
    per_page: String(pageSize),
    search: searchTerm,
  })

  return await apiFetch<FetchContractsResponse>(url, {
    method: "GET",
  });
}
