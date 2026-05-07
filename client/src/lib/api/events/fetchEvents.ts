import apiFetch from "@/lib/apiFetch";
import {buildUrl} from "@/lib/http/buildUrl";
import type { FetchEventsResponse } from "@/types/api-contracts";

export interface FetchEventsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  withContract?: boolean;
  contractId?: number | '';
  eventTypeId?: number | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchEvents({
  page = 1,
  pageSize = 15,
  searchTerm,
  withContract = false,
  contractId,
  eventTypeId,
  sortBy = 'event_date',
  sortOrder = 'desc',
}: FetchEventsParams = {}) {
  const url = buildUrl('/events', {
    page: String(page),
    per_page: String(pageSize),
    search: searchTerm || undefined,
    with_contract: withContract || undefined,
    contract_id: contractId || undefined,
    event_type_id: eventTypeId || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  return await apiFetch<FetchEventsResponse>(url, {
    method: "GET",
  });
}

