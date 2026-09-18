import apiFetch from "@/lib/apiFetch";
import {buildUrl} from "@/lib/http/buildUrl";
import type { FetchEventsResponse } from "@/types/api-contracts";

export async function fetchEvents(page: number = 1, pageSize: number = 15, searchTerm?: string, withContract: boolean = false) {
  const url = buildUrl('/events', {
    page: String(page),
    per_page: String(pageSize),
    search: searchTerm,
    with_contract: withContract
  })

  return await apiFetch<FetchEventsResponse>(url, {
    method: "GET",
  });
}
